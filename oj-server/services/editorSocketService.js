const redisClient = require('../modules/redisClient');
const TIMEOUT_IN_SECONDS = 360;

module.exports = function(io){

    const collaborations = {};
    const socketIdToSessionId = {};
    const sessionPath = '/ojserver/';

    // server is listening on the event 'connection', and callback to handle the request
    io.on('connection', (socket) => {
        // getting the 'sessionId', ie. problem/:id from the client init query. 
        const sessionId = socket.handshake.query['sessionId'];
        socketIdToSessionId[socket.id] = sessionId;

        if (sessionId in collaborations){
            collaborations[sessionId]['participants'].push(socket.id);
            broadcastNewConnectionToParticipants(socket.id, 'newConnected');
            // broadcastToParticipants(sessionId, 'newConnected');
        } else {
            // 1. check if session had historical data
            redisClient.get(sessionPath + sessionId, function(data){
                if(data){   // if there's historical data in redis
                    console.log('retrived historical data from the previous session...');
                    collaborations[sessionId] = {
                        'cachedData': JSON.parse(data),
                        'participants': []
                    };
                }else{
                    console.log('creating new session...');
                    collaborations[sessionId] = {
                        'cachedData': [],
                        'participants': []
                    };
                }
                collaborations[sessionId]['participants'].push(socket.id);
                
            });
        }

        // textChange event handler
        socket.on('textChange', delta => {
            const sessionId = socketIdToSessionId[socket.id];
            console.log('text change ' + sessionId + ' ' + delta);
            if(sessionId in collaborations){
                collaborations[sessionId]['cachedData'].push(
                    ['textChange', delta, Date.now()]
                );
            }
            // send to the other participants excluding self. 
            forwardEvent(socket.id, 'textChange', delta);
        });

        // cursorMove event handler
        socket.on('cursorMove', cursor => {
            console.log('cursor change in session' + socketIdToSessionId[socket.id] + ' ' + cursor);
            cursor = JSON.parse(cursor);
            cursor['socketId'] = socket.id; // add socket.id to cursor obj
            
            forwardEvent(socket.id, 'cursorMove', JSON.stringify(cursor));
        });

        // restoreBuffer event handler
        socket.on('restoreBuffer', () => {
            const sessionId = socketIdToSessionId[socket.id];
            console.log('restore buffer for session: ' + sessionId);
            if(sessionId in collaborations){
                const cachedData = collaborations[sessionId]['cachedData'];
                for(let data of cachedData){
                    socket.emit(data[0], data[1]);  // data[0] is event name data[1] is delta
                }
            } else {
                console.log('something went wrong when restoring buffer');
                throw new Error('logic error at restoreBuffer');
            }
        });

        // disconnect event handler
        socket.on('disconnect', () => {
            console.log('client disconnect ' + socket.id);
            const sessionId = socketIdToSessionId[socket.id];
            // upon disconnect, 1 - clean up socketIdToSessionId after getting sessionId
            delete socketIdToSessionId[socket.id];

            // upon disconnect, 2 - clean up collaborations[sessionId]['participants']
            let foundAndRemoved = false;
            if(sessionId in collaborations){
                // now to find who sent the disconnect event
                const participants = collaborations[sessionId]['participants'];
                const index = participants.indexOf(socket.id);
                
                if (index >= 0) {
                    participants.splice(index, 1);
                    broadcastToParticipants(sessionId,'disconnected');
                    foundAndRemoved = true;
                    
                    console.log('participants left: ', collaborations[sessionId]['participants'].length);
                    if (participants.length === 0){
                        redisClient.set(sessionPath + sessionId,    // key
                                        JSON.stringify(collaborations[sessionId]['cachedData']),    // value
                                        redisClient.redisPrint);    // callback
                        redisClient.expire(sessionPath + sessionId,
                                            TIMEOUT_IN_SECONDS);
                        delete collaborations[sessionId];
                    }
                }
                socket.emit('disconnected', socket.id);     // this should send back to client for client side clean up
            } else {
                console.log('session does not exist...should not have happened...');
            }

            if(!foundAndRemoved){
                console.log('socket id not found in session...should not have happened...');
            }
        });
    });

    const forwardEvent = function(socketId, eventName, eventData){
        const sessionId = socketIdToSessionId[socketId];
        // send to the other participants excluding self. 
        if (sessionId in collaborations){
            const participants = collaborations[sessionId]['participants'];
            for(let participant of participants){
                if (socketId != participant){
                    io.to(participant).emit(eventName, eventData);
                }
            }
        }else{
            console.log('Serious bug');
        }
    }

    const broadcastToParticipants = function(sessionId, eventName){
        const participants = collaborations[sessionId]['participants'];
        for(let participant of participants){
            io.to(participant).emit(eventName, participant, participants.length);
        }
    }

    const broadcastNewConnectionToParticipants = function(socketId, eventName){
        const sessionId = socketIdToSessionId[socketId];
        const participants = collaborations[sessionId]['participants'];
        for(let participant of participants){
            if(socketId != participant){
                io.to(participant).emit(eventName, socketId, participants.length);
            }
        }
    }
}