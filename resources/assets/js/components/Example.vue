<template>
<div class="chat_box" v-bind:id="'chatbox-' + cChat.id" style="right:270px">
            <div class="box box-primary direct-chat direct-chat-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">{{ cChat.name }}</h3> <span>{{ typing }}</span>
                    <div class="box-tools pull-right">
                        <button type="button" class="btn btn-box-tool" data-widget="collapse" @click="chatBoxMinimize(cChat.id)"><i class="fa fa-minus"></i>
                        </button>
                        <button type="button" class="btn btn-box-tool" @click="chatBoxClose(cChat.id)"><i class="fa fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- /.box-header -->
                <div style="" class="box-body">
                    <div class="direct-chat-messages" v-bind:id="'chatboxscroll-' + cChat.id">
                        <div v-for="messagePacket in messages" class="direct-chat-msg" v-bind:class="{ 'right' : (messagePacket.fromUserId == user_id) }" :key="messagePacket.id">
                            <div class="direct-chat-info clearfix">
                                <small class="direct-chat-timestamp"  v-bind:class="{ 'pull-right' : (messagePacket.fromUserId == user_id), 'pull-left' : (messagePacket.fromUserId != user_id) }">{{ messagePacket.date | dateFormat }},{{ messagePacket.time }}</small>
                            </div>

                            <div v-if="messagePacket.type == 'text'" v-bind:class="{ 'pull-right' : (messagePacket.fromUserId == user_id), 'pull-left' : (messagePacket.fromUserId != user_id) }" v-html=messagePacket.message class="direct-chat-text clearfix" style="margin-right: 1px;margin-left: 1px;word-break: break-all;padding: 3px 10px;">
                            </div>

                            <div v-if="messagePacket.type == 'file'" v-bind:class="{ 'pull-right' : (messagePacket.fromUserId == user_id), 'pull-left' : (messagePacket.fromUserId != user_id) }" class="direct-chat-text clearfix" style="margin-right: 1px;margin-left: 1px;word-break: break-all;padding: 3px 3px;">
                                <a v-if="messagePacket.fileFormat == 'image'" :href="'`+WS_URL+`' + messagePacket.filePath" download :title="messagePacket.message" target="_new"><img height="110px;" width="110px;" :src="'`+WS_URL+`' + messagePacket.filePath"></a>
                                <a v-else :href="'`+WS_URL+`' + messagePacket.filePath" download :title="messagePacket.message" target="_new"><span class="info-box-icon" style="color: white;background:none;"><i class="fa fa-paperclip"></i></span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="display: block;" class="box-footer">
                    <div class="input-group">
                        <input name="message" v-bind:id="'msginput-' + cChat.id" v-model.trim="message" placeholder="Type Message And Hit Enter" class="form-control" type="text" v-on:keydown="sendMessage($event)">
                        <span class="input-group-btn">
                            <div class="btn btn-default btn-file">
                                <i class="fa fa-paperclip"></i>
                                <input name="attachment" type="file" v-on:change="file($event)">
                            </div>
                        </span>
                    </div>
                </div>
            </div>
        </div>
</template>