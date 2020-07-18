import fs from "fs"

export default filePath => JSON.parse(fs.readFileSync(filePath))