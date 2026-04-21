import KuroshiroModule from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

const Kuroshiro = KuroshiroModule.default;
const DICTIONARY_PATH = `${import.meta.env.BASE_URL}kuromoji-dict/`;

let kuroshiroInstance = null;
let kuroshiroInitPromise = null;

async function getKuroshiroInstance() {
    if (kuroshiroInstance) {
        return kuroshiroInstance;
    }

    if (!kuroshiroInitPromise) {
        kuroshiroInitPromise = (async () => {
            const instance = new Kuroshiro();
            await instance.init(new KuromojiAnalyzer({ dictPath: DICTIONARY_PATH }));
            kuroshiroInstance = instance;
            return instance;
        })();
    }

    return kuroshiroInitPromise;
}

export async function romanizeWithKuroshiro(text) {
    if (typeof text !== "string" || text.trim() === "") {
        return "";
    }

    const kuroshiro = await getKuroshiroInstance();
    return kuroshiro.convert(text.normalize("NFC"), { to: "romaji" });
}
