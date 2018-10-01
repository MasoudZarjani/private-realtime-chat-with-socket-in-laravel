/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 37);
/******/ })
/************************************************************************/
/******/ ({

/***/ 37:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(38);


/***/ }),

/***/ 38:
/***/ (function(module, exports) {

var WS_URL = $('meta[name=ws_url]').attr("content");
var USER_ID = Number($('meta[name=user_id]').attr("content"));
var socket = io(WS_URL, { query: "id= " + USER_ID });
var app = new Vue({
    el: '#chatApp',
    data: {
        user_id: USER_ID,
        chatLists: [],
        chatBox: [],
        socketConnected: {
            status: false,
            msg: 'Connecting Please Wait...'
        },
        bArr: {}
    },

    methods: {
        chat: function chat(_chat) {
            if (!this.chatBox.includes(_chat.id)) {
                _chat.msgCount = 0;
                var chatboxObj = Vue.extend(chatbox);
                var b = new chatboxObj({
                    propsData: {
                        socket: socket,
                        user_id: this.user_id,
                        cChat: _chat,
                        chatBoxClose: this.chatBoxClose,
                        chatBoxMinimize: this.chatBoxMinimize
                    }
                }).$mount();
                $('body').append(b.$el);
                this.bArr[_chat.id] = b;
                this.chatBox.unshift(_chat.id);
                $('#msginput-' + _chat.id).focus();
            } else {
                var index = this.chatBox.indexOf(_chat.id);
                this.chatBox.splice(index, 1);
                this.chatBox.unshift(_chat.id);
                $('#msginput-' + _chat.id).focus();
            }
            this.calcChatBoxStyle();
        },
        chatBoxClose: function chatBoxClose(eleId) {
            $('#chatbox-' + eleId).remove();
            this.bArr[eleId].$destroy();
            var index = this.chatBox.indexOf(eleId);
            this.chatBox.splice(index, 1);
            this.calcChatBoxStyle();
        },
        chatBoxMinimize: function chatBoxMinimize(eleId) {
            $("#chatbox-" + eleId + " .box-body, #chatbox-" + eleId + " .box-footer").slideToggle('slow');
        },
        calcChatBoxStyle: function calcChatBoxStyle() {
            var i = 270; // start position
            var j = 260; //next position
            this.chatBox.filter(function (value, key) {
                if (key < 4) {
                    $('#chatbox-' + value).css("right", i).show();
                    i = i + j;
                } else {
                    $('#chatbox-' + value).hide();
                }
            });
        }
    }
});
socket.on('connect', function (data) {
    app.socketConnected.status = true;
    socket.emit('chatList', app.user_id);
});
socket.on('connect_error', function () {
    app.socketConnected.status = false;
    app.socketConnected.msg = 'Could not connect to server';
    app.chatLists = [];
});
socket.on('chatListRes', function (data) {
    if (data.userDisconnected) {
        app.chatLists.findIndex(function (el) {
            if (el.socket_id == data.socket_id) {
                el.online = 'N';
                el.socket_id = '';
            }
        });
    } else if (data.userConnected) {
        app.chatLists.findIndex(function (el) {
            if (el.id == data.userId) {
                el.online = 'Y';
                el.socket_id = data.socket_id;
            }
        });
    } else {
        data.chatList.findIndex(function (el) {
            el.msgCount = 0;
        });
        app.chatLists = data.chatList;
    }
});
// user chat box not open, count incomming  messages
socket.on('addMessageResponse', function (data) {
    if (!app.chatBox.includes(data.fromUserId)) {
        app.chatLists.findIndex(function (el) {
            if (el.id == data.fromUserId) {
                el.msgCount += 1;
            }
        });
    }
});

var chatbox = {
    data: function data() {
        return {
            messages: [],
            message: '',
            typing: '',
            timeout: ''
        };
    },
    props: ['user_id', 'cChat', 'socket', 'chatBoxClose', 'chatBoxMinimize'],
    mounted: function mounted() {
        socket.emit('getMessages', { fromUserId: this.user_id, toUserId: this.cChat.id });
        socket.on('getMessagesResponse', this.getMessagesResponse);
        socket.on('addMessageResponse', this.addMessageResponse);
        socket.on('typing', this.typingListener);
        socket.on('image-uploaded', this.imageuploaded);
    },
    destroyed: function destroyed() {
        socket.removeListener('getMessagesResponse', this.getMessagesResponse);
        socket.removeListener('addMessageResponse', this.addMessageResponse);
        socket.removeListener('typing', this.typingListener);
    },
    methods: {
        sendMessage: function sendMessage(event) {
            if (event.keyCode === 13) {
                if (this.message.length > 0) {
                    var messagePacket = this.createMsgObj('text', '', this.message);
                    this.socket.emit('addMessage', messagePacket);
                    this.messages.push(messagePacket);
                    this.message = "";
                    this.scrollToBottom();
                } else {
                    alert("Please Enter Your Message.");
                }
            } else {
                if (event.keyCode != 116 && event.keyCode != 82 && !event.ctrlKey) {
                    this.socket.emit('typing', { typing: 'نوشتن...', socket_id: this.cChat.socket_id });
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(this.timeoutFunction, 500);
                }
            }
        },
        timeoutFunction: function timeoutFunction() {
            socket.emit("typing", { typing: false, socket_id: this.cChat.socket_id });
        },
        scrollToBottom: function scrollToBottom() {
            $("#chatboxscroll-" + this.cChat.id).stop().animate({ scrollTop: $("#chatboxscroll-" + this.cChat.id)[0].scrollHeight }, 1);
        },
        createMsgObj: function createMsgObj(type, fileFormat, message) {
            return {
                type: type,
                fileFormat: fileFormat,
                filePath: '',
                fromUserId: this.user_id,
                toUserId: this.cChat.id,
                toSocketId: this.cChat.socket_id,
                message: message,
                time: new moment().format("hh:mm A"),
                date: new moment().format("Y-MM-D")
            };
        },
        addMessageResponse: function addMessageResponse(data) {
            if (data && data.fromUserId == this.cChat.id) {
                this.messages.push(data);
                this.scrollToBottom();
            }
        },
        typingListener: function typingListener(data) {
            if (data.typing && data.to_socket_id == this.cChat.socket_id) {
                this.typing = "در حال " + data.typing;
            } else {
                this.typing = "";
            }
        },
        getMessagesResponse: function getMessagesResponse(data) {
            if (data.toUserId == this.cChat.id) {
                this.messages = data.result;
                this.$nextTick(function () {
                    this.scrollToBottom();
                });
            }
        },
        imageuploaded: function imageuploaded(data) {
            if (data && data.toUserId == this.cChat.id) {
                $(".overlay").parent().parent().remove();
                this.messages.push(data);
                this.scrollToBottom();
            }
        },
        file: function file(event) {
            var file = event.target.files[0];
            if (this.validateSize(file)) {
                var fileFormat = file.type.split('/')[0];
                var reader = new FileReader();
                reader.onload = function () {
                    var messagePacket = this.createMsgObj('file', fileFormat, reader.result);
                    messagePacket['fileName'] = file.name;
                    socket.emit('upload-image', messagePacket);
                    messagePacket.type = "text";
                    if (fileFormat != 'image') {
                        messagePacket.message = '<span class="info-box-icon bg-primary" style="color: white;background:none;"><i class="fa fa-paperclip"></i></span><div class="overlay"><i style="color:#fff" class="fa fa-refresh fa-spin"></i></div>';
                    } else {
                        var src = URL.createObjectURL(new Blob([reader.result]));
                        messagePacket.message = '<img height="100px;" width="100px;" src="' + src + '"><div class="overlay"><i style="color:#fff" class="fa fa-refresh fa-spin"></i></div>';
                    }
                    this.messages.push(messagePacket);
                    this.scrollToBottom();
                }.bind(this);
                reader.readAsArrayBuffer(file);
            } else {
                event.target.value = "";
                alert('File size exceeds 10 MB');
            }
        },
        validateSize: function validateSize(file) {
            var fileSize = file.size / 1024 / 1024; // in MB
            if (fileSize > 10) {
                return false;
            }
            return true;
        }
    },
    filters: {
        dateFormat: function dateFormat(value) {
            return new moment(value).format("D-MMM-YY");
        }
    },
    template: '\n        <div class="chat_box" v-bind:id="\'chatbox-\' + cChat.id" style="right:270px">\n            <div class="box box-primary direct-chat direct-chat-primary">\n                <div class="box-header with-border">\n                    <h3 class="box-title text-right" style="float: right;margin-right: 60px;">{{ cChat.name }}</h3> <span style="text-align:right;direction:rtl">{{ typing }}</span>\n                    <div class="box-tools pull-left">\n                        <button type="button" class="btn btn-box-tool" data-widget="collapse" @click="chatBoxMinimize(cChat.id)"><i class="fa fa-minus"></i>\n                        </button>\n                        <button type="button" class="btn btn-box-tool" @click="chatBoxClose(cChat.id)"><i class="fa fa-times"></i>\n                        </button>\n                    </div>\n                </div>\n\n                <!-- /.box-header -->\n                <div style="" class="box-body">\n                    <div class="direct-chat-messages" v-bind:id="\'chatboxscroll-\' + cChat.id">\n                        <div v-for="messagePacket in messages" class="direct-chat-msg" v-bind:class="{ \'right\' : (messagePacket.fromUserId == user_id) }">\n                            <div class="direct-chat-info clearfix">\n                                <small class="direct-chat-timestamp"  v-bind:class="{ \'pull-right\' : (messagePacket.fromUserId == user_id), \'pull-left\' : (messagePacket.fromUserId != user_id) }">{{ messagePacket.date | dateFormat }},{{ messagePacket.time }}</small>\n                            </div>\n\n                            <div v-if="messagePacket.type == \'text\'" v-bind:class="{ \'pull-right\' : (messagePacket.fromUserId == user_id), \'pull-left\' : (messagePacket.fromUserId != user_id) }" v-html=messagePacket.message class="direct-chat-text clearfix" style="margin-right: 1px;margin-left: 1px;word-break: break-all;padding: 3px 10px;">\n                            </div>\n\n                            <div v-if="messagePacket.type == \'file\'" v-bind:class="{ \'pull-right\' : (messagePacket.fromUserId == user_id), \'pull-left\' : (messagePacket.fromUserId != user_id) }" class="direct-chat-text clearfix" style="margin-right: 1px;margin-left: 1px;word-break: break-all;padding: 3px 3px;">\n                                <a v-if="messagePacket.fileFormat == \'image\'" :href="\'' + WS_URL + '\' + messagePacket.filePath" download :title="messagePacket.message" target="_new"><img height="110px;" width="110px;" :src="\'' + WS_URL + '\' + messagePacket.filePath"></a>\n                                <a v-else :href="\'' + WS_URL + '\' + messagePacket.filePath" download :title="messagePacket.message" target="_new"><span class="info-box-icon" style="color: white;background:none;"><i class="fa fa-paperclip"></i></span>\n                                </a>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <div style="display: block;" class="box-footer">\n                    <div class="input-group">\n                        <input name="message" v-bind:id="\'msginput-\' + cChat.id" v-model.trim="message" placeholder="\u067E\u06CC\u0627\u0645..." class="form-control" type="text" v-on:keydown="sendMessage($event)">\n                        <span class="input-group-btn">\n                            <div class="btn btn-default btn-file">\n                                <i class="fa fa-paperclip"></i>\n                                <input name="attachment" type="file" v-on:change="file($event)">\n                            </div>\n                        </span>\n                    </div>\n                </div>\n            </div>\n        </div>'
};

/***/ })

/******/ });