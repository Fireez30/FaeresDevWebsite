import "./Empty.css";
import { Link } from "react-router-dom";

const sections = [
    {
        title: "Pokemon Role Playing Games",
        items: [
            {
                title: "Pokemon Generator",
                href: "/pokemon-generator",
                description: "Build a Pokemon sheet with level, rarity, abilities, stats, moves, and export-oriented data in one place.",
            },
            {
                title: "Pokemon Rolls",
                href: "/pokemon-rolls",
                description: "Handle encounter, capture, shiny, and card rolls with dedicated utilities and quick result feedback.",
            },
            {
                title: "Pokemon Team Card",
                href: "/pokemon-team-card",
                description: "Pick up to six Pokemon in order, upload a custom image, and export a 480p team card with the full squad layout.",
            },
            {
                title: "Pokemon Encounter Generator",
                href: "/pokemon-encounter-generator",
                description: "Create encounter zones with common, uncommon, rare, and super rare sections, then load or save them as JSON files.",
            },
        ],
    },
    {
        title: "Japanese Learning",
        items: [
            {
                title: "Hiragana Training",
                href: "/hiragana-training",
                description: "Practice hiragana in both directions: read kana into romaji or match romaji back to the correct hiragana.",
            },
            {
                title: "Katakana Training",
                href: "/katakana-training",
                description: "Train katakana with the same two quiz modes and score tracking to keep repetition simple and continuous.",
            },
            {
                title: "Kanji Training",
                href: "/kanji-training",
                description: "Practice kanji by matching each character with its translation, then reverse the direction when you want harder recall.",
            },
            {
                title: "Color Sentence Trainer",
                href: "/japanese-sentence-color-trainer",
                description: "Color each Japanese character or group by script type, including kana pauses, long vowels, and optional romaji elements.",
            },
        ],
    },
];

function Empty() {
    return (
        <div className="home-page">
            <section className="home-hero">
                <h1>Faeres dev website.</h1>
                <br/>
                <table>
                    <tr>
                        <th><img className="home-self-img" src="/fireez3.png"/></th>
                        <th><p className="home-subtitle">
                            I'm a 29 years old developer from France. I've worked for virtual reality patient rehabilitation.
                            <br/>
                            I've moved in a team of research an as engineer on a 3D + t data online visualization and curation tool.
                            <br/>
                            Finally, I've joined a biology research team to develop image and data analysis tool, while still working on the 3D +t platform.
                            <br/><br/>
                            I coded this website to :
                            <br/><br/>
                            - Share tools for the Pokemon RPG I'm in
                            <br/>
                            - Share tools I use to learn Japanese
                            <br/>
                            - (Coming) Host images, descriptions and videos of my studies and personal project
                        </p></th>
                    </tr>
                </table>
            </section>

            <section className="home-sections">
                {sections.map((section) => (
                    <div className="home-section" key={section.title}>
                        <div className="home-section-header">
                            <h2>{section.title}</h2>
                        </div>
                        <div className="home-grid">
                            {section.items.map((item) => (
                                <article className="home-card" key={item.title}>
                                    <h3>
                                        <Link className="home-card-link" to={item.href}>
                                            {item.title}
                                        </Link>
                                    </h3>
                                    <p>{item.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}

export default Empty;
