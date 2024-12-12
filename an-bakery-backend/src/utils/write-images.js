const IMAGE_DIRECTORY = (productId) => `./public/images/${productId}/`;

const fs = require("fs");

const writeImage = async ({ cakeId, base64Url, fileName }) => {
    const base64data = base64Url.replace(/^data:.*,/, "");

    if (!fs.existsSync(IMAGE_DIRECTORY(cakeId))) {
        await fs.mkdirSync(IMAGE_DIRECTORY(cakeId));
    }

    fs.writeFileSync(IMAGE_DIRECTORY(cakeId) + fileName, base64data, "base64");
};

module.exports = { writeImage };