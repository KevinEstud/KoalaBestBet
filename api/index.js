require('dotenv').config();
const PORT = process.env.PORT || 5050;
const express = require('express');
const router = require('./app/router');
const corsOptions = require('./app/config/corsOptions');
const credentials = require('./app/utils/credentials');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const http = require("http").Server(app);
const tchat = require('./app/dataMappers/tchat');
const groups = require('./app/dataMappers/group');
const io = require("socket.io")(http, {
    cors: {
      methods: ["GET", "POST"],
      credentials: true
    }
  });

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(express.json())
app.use(express.static('public'));
app.use(credentials);
app.use(cors(corsOptions, { credentials: true }));
app.use(express.urlencoded({
    extended: true
}));
io.on("connection", (socket) => {
    socket.emit('connection_succes')
    socket.on("enter_room", async (room) => {
        socket.join(room);
        let roomName = [...socket.rooms].slice(1, )[0]
        await tchat.getAllMessageByRoom(roomName.toLowerCase()).then(list => {
            socket.emit("init_messages", {messages: list});
        });
    });
    socket.on("chat_message", async (msg) => {
        console.log(msg)
        const response = await tchat.addMessage( msg.username, msg.message, msg.avatar_path, msg.color, msg.room ).then(() => {
            io.in(msg.room).emit("received_message", msg);
        }).catch(e => {
            console.log(e);
        });    
    });
    socket.on("leave_room", (room) => {
        console.log('leave', room)
        socket.leave(room);
    });
    socket.on("new_group", async (group) => {
        await groups.getInfosFromGroupIfPublicByName(group.name).then((res) => {
                io.emit("new_group_created", { groups : res })
            }).catch((e) => console.log(e))
    })
    socket.on("searching_group", async (username) => {
        await groups.getInfosFromGroupIfPublic(username).then((res) => {
                io.emit("init_public_group", { groups : res })
            }).catch((e) => console.log(e))
    })
    socket.on("delete_group", async (group) => {
            io.emit("group_deleted", { group_id : group.group_id })
    })
    socket.on("leaving_group", async (group) => {
        if(isNaN(group.group_id)) {
            console.log('Un problème est survenu.')
        } else {
            await groups.getNumberOfPlayersByGroupId(parseInt(group.group_id)).then(async (res) => {
                if(parseInt(res.nb_participants) + 1 === parseInt(res.nb_participants_max)) {
                    await groups.getInfosFromGroupIfPublicByIdAndAvalaible(parseInt(group.group_id)).then((res) => {
                        io.emit("new_place_avalaible", { groups : res})
                    })
                    } else {
                    io.emit("player_leaved", { group_id : group.group_id })
                }
            }).catch((e) => console.log('Un problème est survenu.'))
        }
})
    socket.on('joining_group', async (group_id) => {
        try {
            const verifyIfGroupIsFull2 = await groups.getInfosFromGroupIfPublicById(parseInt(group_id.group_id))
            if (parseInt(verifyIfGroupIsFull2.nb_participants) === parseInt(verifyIfGroupIsFull2.nb_participants_max)) {
            io.emit("group_full", {group_id: group_id.group_id})
            } else {
                io.emit("player_joined", { group_id: group_id.group_id })
            }

        } catch (e) {
            console.log(e)
        }
        })
});
app.use(router);
http.listen(PORT);
