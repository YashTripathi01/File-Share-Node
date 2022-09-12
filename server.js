require("dotenv").config();
const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const app = express();
const upload = multer({ dest: "uploads" });
const File = require("./models/File");

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.get("/", (req, res) => {
    res.render("index");
    return;
});

app.post("/upload", upload.single("file"), async (req, res) => {
    const fileData = {
        path: req.file.path,
        originalName: req.file.originalname,
    };
    if (req.body.password != null && req.body.password !== "") {
        fileData.password = await bcrypt.hash(req.body.password, 10);
    }
    const file = await File.create(fileData);
    // console.log(file)
    // res.send(file.originalName)
    res.render("index", { fileLink: `${req.headers.origin}/file/${file.id}` });
    return;
});

app.route("/file/:id").get(handleDownload).post(handleDownload);
// app.get('/file/:id', handleDownload)
// app.post('/file/:id', handleDownload)

async function handleDownload(req, res) {
    const file = await File.findById(req.params.id);
    if (file.password != null) {
        if (req.body.password == null) {
            res.render("password");
            return;
        }
        if (!(await bcrypt.compare(req.body.password, file.password))) {
            res.render("password", { error: true });
            return;
        }
    }

    file.downloadCount++;
    await file.save();
    console.log(file.downloadCount);

    res.download(file.path, file.originalName);
    return;
}

const ip = require("ip").address();

// app.listen(process.env.PORT, ip, () => console.log('Server up and running at http://' + ip + ':3000'))
app.listen(process.env.PORT, ip, () =>
    console.log(`Server up and running at http://${ip}:${process.env.PORT}`)
);
