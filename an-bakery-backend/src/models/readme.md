# File Name

`{ModelName}Model.js`

# Code Template

```
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const {ModelName} = new Schema({
    #config here
});

module.exports = mongoose.model("{pluralnames}", {ModelName});
```
