import getPrismaInstance from "../utils/PrismaClient.js";
import {renameSync} from 'fs';

export const addMessage = async(req,res,next) =>{
    try {
        const prisma = getPrismaInstance();
        const {message,from,to} = req.body;
        const getUser = onlineUsers.get(to);
        if(message && from && to){
            const newMessage = await prisma.messages.create({
                data:{
                    messages:message,
                    sender:{connect:{id:parseInt(from)}},
                    reciever:{connect:{id:parseInt(to)}},
                    messageStatus:getUser?"delivered":"sent",
                },
                include:{sender:true,reciever:true},
            }).catch(console.error);
            return res.status(201).send({message:newMessage});
        }
        return res.status(400).send("From,to and Message is required.");
    } catch (err) {
        next(err);
    }
};

export const getMessages = async(req,res) => {
    try {
        const prisma = getPrismaInstance();
        const {from,to} = req.params;
        
        const messages = await prisma.messages.findMany({
            where:{
                OR:[
                    {
                        senderId: parseInt(from),
                        recieverId: parseInt(to),
                    },
                    {
                        senderId: parseInt(to),
                        recieverId: parseInt(from),
                    },
                ],
            },
            orderBy:{
                id:"asc",
            }
        });

        const unreadMessages = [];
        messages.forEach((message,index) =>{
            if(
                message.messageStatus !== "read" && 
                message.senderId === parseInt(to)
            ) {
                messages[index].messageStatus="read";
                unreadMessages.push(message.id);
            }
        });

        await prisma.messages.updateMany({
            where:{
                id:{in:unreadMessages},
            },data:{
                  messageStatus:"read",
            },
        });
        res.status(200).json({messages});
    } catch (err) {
        next(err);
    }
};

export const addImageMessage = async ( req,res,next)=>{
    try {
        if(req.file){
            const date= Date.now();
            let fileName = `uploads/images/${date}-${req.file.originalname}`;
            renameSync(req.file.path,fileName);
            const prisma = getPrismaInstance();
            const {from,to} = req.query;

            if(from && to){
                const message = await prisma.messages.create({
                    data:{
                        messages:  fileName,
                        sender: { connect :{ id: parseInt(from)}},
                        reciever:{connect:{id:parseInt(to)}},
                        type:"image",
                    }
                });
                return res.status(201).json({message});
            }
            return res.status(400).send("From, to is required.");
        }
        return res.status(400).send("Image is required");
    } catch (err) {
        next(err);
        
    }
};

export const addAudioMessage = async ( req,res,next)=>{
    try {
        if(req.file){
            const date= Date.now();
            let fileName = `uploads/recordings/${date}-${req.file.originalname}`;
            renameSync(req.file.path,fileName);
            const prisma = getPrismaInstance();
            const {from,to} = req.query;

            if(from && to){
                const message = await prisma.messages.create({
                    data:{
                        messages:  fileName,
                        sender: { connect :{ id: parseInt(from)}},
                        reciever:{connect:{id:parseInt(to)}},
                        type:"audio",
                    }
                });
                return res.status(201).json({message});
            }
            return res.status(400).send("From, to is required.");
        }
        return res.status(400).send("Audio is required");
    } catch (err) {
        next(err);
        
    }
};

export const getInitialContactswithMessages = async (req,res,next) =>{
    try {
        const userId = parseInt(req.params.from);
        const prisma = getPrismaInstance();
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                sentMessages: {
                    include: {
                        reciever: true,
                        sender: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
                receivedMessages: {
                    include: {
                        reciever: true,
                        sender: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        if (user) {
            const messagesMap = new Map();
            const messages = [...user.sentMessages, ...user.receivedMessages];
            messages.forEach((message) => {
                const isOutgoing = message.senderId === userId;
                const calculatedId = isOutgoing ? message.recieverId : message.senderId;
                if (messagesMap.has(calculatedId)) {
                    if (messagesMap.get(calculatedId).createdAt < message.createdAt) {
                        messagesMap.set(calculatedId, message);
                    }
                } else {
                    messagesMap.set(calculatedId, message);
                }
            });
            const conversations = [];
            messagesMap.forEach((message, id) => {
                conversations.push({
                    lastMessage: message.messages,
                    lastMessageTime: message.createdAt,
                    totalUnreadMessages: 0,
                    ...message,
                });
            });
            res.status(200).json({ user: conversations });
        } else {
            res.status(200).json({ user: [] });
        }
    } catch (err) {
        next(err);
    }
};