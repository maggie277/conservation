import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import ProjectCard from "../components/ProjectCard";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [type, setType] = useState("farmer"); // Changed from individual to farmer
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [nrcPassport, setNrcPassport] = useState("");
  const [country, setCountry] = useState("Zambia"); // Default to Zambia
  const [address, setAddress] = useState("");
  const [projects, setProjects] = useState([]);
  const [contributions, setContributions] = useState("");
  const [cooperativeName, setCooperativeName] = useState(""); // Changed from organization
  const [cooperativeAddress, setCooperativeAddress] = useState("");
  const [cooperativePhone, setCooperativePhone] = useState("");
  const [cooperativeWebsite, setCooperativeWebsite] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [cooperativeId, setCooperativeId] = useState(""); // Changed from companyId
  const [errors, setErrors] = useState({});
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editedProject, setEditedProject] = useState({
    title: "",
    description: "",
    category: "",
    fundingGoal: "",
    imageUrl: ""
  });

  useEffect(() => {
    const fetchUserData = async (uid) => {
      try {
        const q = query(collection(db, "users"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnapshot = querySnapshot.docs[0];
          const docData = docSnapshot.data();
          setUserData({ ...docData, id: docSnapshot.id });
          setEmail(docData.email);
          setType(docData.type || "farmer");
          setFirstName(docData.firstName || "");
          setLastName(docData.lastName || "");
          setAge(docData.age || "");
          setNrcPassport(docData.nrcPassport || "");
          setCountry(docData.country || "Zambia");
          setAddress(docData.address || "");
          setContributions(docData.contributions || "");
          setCooperativeName(docData.cooperativeName || "");
          setCooperativeAddress(docData.cooperativeAddress || "");
          setCooperativePhone(docData.cooperativePhone || "");
          setCooperativeWebsite(docData.cooperativeWebsite || "");
          setMissionStatement(docData.missionStatement || "");
          setCooperativeId(docData.cooperativeId || "");

          const projectsQuery = query(collection(db, "projects"), where("userId", "==", uid));
          const projectsSnapshot = await getDocs(projectsQuery);
          const projectsData = projectsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProjects(projectsData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (type === "farmer") {
      if (!firstName) newErrors.firstName = "First Name is required";
      if (!lastName) newErrors.lastName = "Last Name is required";
      if (!nrcPassport) newErrors.nrcPassport = "NRC is required";
    } else if (type === "cooperative") {
      if (!cooperativeName) newErrors.cooperativeName = "Cooperative Name is required";
      if (!cooperativeAddress) newErrors.cooperativeAddress = "Cooperative Address is required";
      if (!cooperativePhone) newErrors.cooperativePhone = "Phone number is required";
      if (!missionStatement) newErrors.missionStatement = "Mission Statement is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const userRef = doc(db, "users", userData.id);
      await updateDoc(userRef, {
        type,
        firstName,
        lastName,
        age,
        nrcPassport,
        country,
        address,
        contributions,
        cooperativeName,
        cooperativeAddress,
        cooperativePhone,
        cooperativeWebsite,
        missionStatement,
        cooperativeId
      });
      setIsEditing(false);
      setUserData((prevData) => ({
        ...prevData,
        type,
        firstName,
        lastName,
        age,
        nrcPassport,
        country,
        address,
        contributions,
        cooperativeName,
        cooperativeAddress,
        cooperativePhone,
        cooperativeWebsite,
        missionStatement,
        cooperativeId
      }));
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteDoc(doc(db, "projects", projectId));
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleEditProject = (project) => {
    setEditingProjectId(project.id);
    setEditedProject({
      title: project.title,
      description: project.description,
      category: project.category,
      fundingGoal: project.fundingGoal,
      imageUrl: project.imageUrl || ""
    });
  };

  const handleSaveProjectEdit = async (projectId) => {
    try {
      await updateDoc(doc(db, "projects", projectId), editedProject);
      setProjects(projects.map(project => 
        project.id === projectId ? { ...project, ...editedProject } : project
      ));
      setEditingProjectId(null);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
  };

  if (!userData) return <div className="loading-spinner">Loading farm profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>My Farm Profile</h2>
        
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="profile-form">
            {type === "farmer" ? (
              <>
                <div className="form-group">
                  <label>First Name*</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  {errors.firstName && <span className="error">{errors.firstName}</span>}
                </div>
                
                <div className="form-group">
                  <label>Last Name*</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  {errors.lastName && <span className="error">{errors.lastName}</span>}
                </div>
                
                <div className="form-group">
                  <label>NRC Number*</label>
                  <input type="text" value={nrcPassport} onChange={(e) => setNrcPassport(e.target.value)} 
                    placeholder="e.g. 123456/78/9" />
                  {errors.nrcPassport && <span className="error">{errors.nrcPassport}</span>}
                </div>
                
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} 
                    placeholder="Farm location in Zambia" />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Cooperative Name*</label>
                  <input type="text" value={cooperativeName} onChange={(e) => setCooperativeName(e.target.value)} />
                  {errors.cooperativeName && <span className="error">{errors.cooperativeName}</span>}
                </div>
                
                <div className="form-group">
                  <label>Cooperative ID</label>
                  <input type="text" value={cooperativeId} readOnly />
                </div>
                
                <div className="form-group">
                  <label>Address*</label>
                  <input type="text" value={cooperativeAddress} onChange={(e) => setCooperativeAddress(e.target.value)} />
                  {errors.cooperativeAddress && <span className="error">{errors.cooperativeAddress}</span>}
                </div>
                
                <div className="form-group">
                  <label>Phone*</label>
                  <input type="text" value={cooperativePhone} onChange={(e) => setCooperativePhone(e.target.value)} 
                    placeholder="e.g. +260..." />
                  {errors.cooperativePhone && <span className="error">{errors.cooperativePhone}</span>}
                </div>
                
                <div className="form-group">
                  <label>Mission Statement*</label>
                  <textarea value={missionStatement} onChange={(e) => setMissionStatement(e.target.value)} />
                  {errors.missionStatement && <span className="error">{errors.missionStatement}</span>}
                </div>
              </>
            )}
            
            <div className="form-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="profile-info">
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Account Type:</strong> {type === "farmer" ? "Individual Farmer" : "Farming Cooperative"}</p>
              
              {type === "farmer" ? (
                <>
                  <p><strong>Name:</strong> {firstName} {lastName}</p>
                  {nrcPassport && <p><strong>NRC:</strong> {nrcPassport}</p>}
                  {address && <p><strong>Farm Location:</strong> {address}, Zambia</p>}
                </>
              ) : (
                <>
                  <p><strong>Cooperative:</strong> {cooperativeName}</p>
                  {cooperativeId && <p><strong>Cooperative ID:</strong> {cooperativeId}</p>}
                  {cooperativeAddress && <p><strong>Address:</strong> {cooperativeAddress}</p>}
                  {cooperativePhone && <p><strong>Phone:</strong> {cooperativePhone}</p>}
                  {missionStatement && <p><strong>Mission:</strong> {missionStatement}</p>}
                </>
              )}
            </div>
            
            <div className="profile-actions">
              <button onClick={() => setIsEditing(true)} className="edit-btn">
                Edit Profile
              </button>
              <button onClick={handleSignOut} className="signout-btn">
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>

      <div className="projects-section">
        <h3>My Farming Projects</h3>
        
        {projects.length > 0 ? (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isEditing={editingProjectId === project.id}
                editedProject={editedProject}
                setEditedProject={setEditedProject}
                handleEditProject={handleEditProject}
                handleSaveProjectEdit={handleSaveProjectEdit}
                handleCancelEdit={handleCancelEdit}
                handleDeleteProject={handleDeleteProject}
                isProfileView={true}
              />
            ))}
          </div>
        ) : (
          <div className="no-projects">
            <p>You haven't created any farming projects yet.</p>
            <a href="/projects/upload-project" className="create-project-btn">
              Create Your First Project
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;