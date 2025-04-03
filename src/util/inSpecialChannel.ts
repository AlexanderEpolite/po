
//special channels for testing stuff, you might want to make this an empty array
export default function inSpecialChannel(id: string): boolean {
    return ["1195238787966570506", "1102477504842833932", "999371619040505918"].includes(id);
}