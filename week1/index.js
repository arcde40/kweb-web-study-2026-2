const express = require("express");

const app = express();
const port = 3030;

app.get("/hello", (request, response) => {
    response.send("Hello, World!");
});

app.get("/bye", (request, response) => {
    response.send("Goodbye, World!");
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
