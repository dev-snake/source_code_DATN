# File Name

`{routerName}Router.js`

# Code Template

```
const express = require("express");
const router = express.Router();

const [controllerName]Controller = require("./controllers/[ControllerName]Controller");

router.get("/", [controllerName]Controller.[appropriateFunction]);

module.exports = router;
```
