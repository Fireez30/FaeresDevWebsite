import { useState, useEffect } from "react";
import "./Projects.css";

function toAnchor(name) {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function getYouTubeId(url) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
}

function isRenderableImage(path) {
    if (!path) return false;
    const ext = path.split(".").pop().toLowerCase();
    return ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);
}

function ProjectMedia({ image, video }) {
    const isYoutube = video && (video.includes("youtube.com") || video.includes("youtu.be"));
    const isLocalVideo = video && !isYoutube;

    if (isYoutube) {
        const videoId = getYouTubeId(video);
        return (
            <div className="project-media">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="Project video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    if (isLocalVideo) {
        return (
            <div className="project-media">
                <video controls>
                    <source src={`/${video}`} type="video/mp4" />
                </video>
            </div>
        );
    }

    if (isRenderableImage(image)) {
        return (
            <div className="project-media project-media--image">
                <img src={`/${image}`} alt="" />
            </div>
        );
    }

    return null;
}

function ProjectCard({ project }) {
    const isDropped = project.name.startsWith("Dropped:");
    return (
        <article className={`project-card${isDropped ? " project-card--dropped" : ""}`}>
            <ProjectMedia image={project.image} video={project.video} />
            <div className="project-card-body">
                <h3 className="project-card-title">{project.name}</h3>
                {project.description && (
                    <p className="project-card-desc">{project.description}</p>
                )}
                {project.sources && (
                    <a
                        className="project-card-link"
                        href={project.sources}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Source Code →
                    </a>
                )}
            </div>
        </article>
    );
}

function Projects() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch("/projects.json")
            .then((r) => r.json())
            .then(setData);
    }, []);

    if (!data) return <div className="projects"><p className="projects-loading">Loading…</p></div>;

    return (
        <div className="projects">
            <section className="projects-hero">
                <p className="projects-kicker">Portfolio</p>
                <h1>My Projects</h1>
            </section>

            <nav className="projects-toc">
                <h2 className="projects-toc-heading">Table of Contents</h2>
                <ul className="projects-toc-list">
                    {data.categories.map((cat) => (
                        <li key={cat.name}>
                            <a href={`#${toAnchor(cat.name)}`} className="projects-toc-link">
                                {cat.name}
                                <span className="projects-toc-count">{cat.projects.length}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {data.categories.map((cat) => (
                <section
                    id={toAnchor(cat.name)}
                    key={cat.name}
                    className="projects-category"
                >
                    <h2 className="projects-category-title">{cat.name}</h2>
                    <div className="projects-grid">
                        {cat.projects.map((project) => (
                            <ProjectCard key={project.name} project={project} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

export default Projects;