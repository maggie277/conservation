import React from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from "react-share";
import "./ProjectCard.css"; // Import the CSS file for styling

const ProjectCard = ({ project, handleDeleteProject }) => {
  return (
    <div className="project-card">
      {/* Project Image */}
      <img src={project.imageUrl} alt={project.title} className="project-image" />

      {/* Project Details */}
      <h4>{project.title}</h4>
      <p>{project.description}</p>
      <p>
        <strong>Goal:</strong> {project.goal}
      </p>

      {/* Social Media Sharing Buttons */}
      <div className="social-share-buttons">
        <FacebookShareButton
          url={`https://yourwebsite.com/projects/${project.id}`} // Replace with your project URL
          quote={`Check out this conservation project: ${project.title}`}
        >
          <FacebookIcon size={32} round />
        </FacebookShareButton>

        <TwitterShareButton
          url={`https://yourwebsite.com/projects/${project.id}`}
          title={`Check out this conservation project: ${project.title}`}
        >
          <TwitterIcon size={32} round />
        </TwitterShareButton>

        <LinkedinShareButton
          url={`https://yourwebsite.com/projects/${project.id}`}
          title={project.title}
          summary={project.description}
        >
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => handleDeleteProject(project.id)}
        className="delete-button"
      >
        Delete Project
      </button>
    </div>
  );
};

export default ProjectCard;