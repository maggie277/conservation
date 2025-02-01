import React, { useState } from 'react';
import axios from 'axios';

const UploadProject = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  // Handle image upload
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("upload_preset", "ml_default"); // Use your actual upload preset

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dz5gjdu9v/image/upload", // Use your Cloudinary cloud name here
        formData
      );
      setImageUrl(res.data.secure_url); // Store the image URL
    } catch (err) {
      console.error("Error uploading image", err);
    }
  };

  return (
    <div>
      <h2>Upload a Project Image</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {imageUrl && <img src={imageUrl} alt="Project" />}
    </div>
  );
};

export default UploadProject;
