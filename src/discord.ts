import axios, { AxiosInstance } from "axios";
import { RunStepsPage } from "openai/resources/beta/threads/runs/steps";
const EventEmitter = require("events");
import WebSocket from "ws";
const configFiles = require("../config.json");
const TARGETS = configFiles.targets;

process.env.TZ = "Europe/Paris";

interface discord_event {
  t: string;
  s: number;
  op: number;
  d: Object;
}

class DiscordClient extends EventEmitter {
  private token: string;
  private headers;
  private ws: WebSocket;
  private is_authenticated: boolean = false;
  private heartbeat_interval: number = 4125;

  constructor(token: string) {
    super();
    this.token = token;
    this.ws = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json");
    this.headers = {
      authority: "discord.com",
      authorization: token,
      "content-type": "application/json",
    };

    this.init_connection();
    this.startHeartbeat();
    //this.display_time_as_status();
  }

  init_connection() {
    this.ws = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json");
    // Handle the WebSocket open event
    this.ws.onopen = () => {
      this.emit("open");
      this.authentication();
    };

    // Handle the WebSocket close event
    this.ws.onclose = (s) => {
      //console.log(s);
      this.emit("close");

      setTimeout(() => {
        this.init_connection();
      }, 1000);
    };

    // Handle the WebSocket message event
    this.ws.onmessage = (event) => {
      if (this.is_authenticated == false) {
        this.authentication();
        this.heartbeat_interval = JSON.parse(
          event.data.toString()
        ).d.heartbeat_interval;
        this.is_authenticated = true;
      } else {
        const event_income = JSON.parse(event.data.toString());
        const { t, s, op, d } = event_income;
        switch (t) {
          case "READY": {
            this.emit("READY", d.user.username);
            break;
          }

          case "MESSAGE_CREATE": {
            this.emit("MESSAGE_CREATE", d);
          }
        }
      }
    };
  }

  startHeartbeat() {
    const sendHeartbeat = () => {
      let keep_alive_opcode = Buffer.from(JSON.stringify({ op: 1, d: null }));
      this.ws.send(keep_alive_opcode);
      //console.log("heartbeat sent");
    };
    setInterval(sendHeartbeat, this.heartbeat_interval * 10); //to be replaced by this.hearbeat_intervals * 1000
  }

  authentication() {
    //Authentication
    this.ws.send(
      JSON.stringify({
        op: 2,
        d: {
          token: this.token,
          capabilities: 16381,
          properties: {
            os: "Linux",
            browser: "Chrome",
            device: "",
          },
          presence: {
            status: "offline",
            since: 0,
            activities: [],
            afk: "false",
          },
          compress: "false",
        },
      })
    );
  }

  async display_time_as_status() {
    const sendHour = () => {
      const maintenant = new Date();
      let hours =
        maintenant.getHours().toString().length == 1
          ? "0" + maintenant.getHours().toString()
          : maintenant.getHours();
      let minutes =
        maintenant.getMinutes().toString().length == 1
          ? "0" + maintenant.getMinutes().toString()
          : maintenant.getMinutes();
      let seconds =
        maintenant.getSeconds().toString().length == 1
          ? "0" + maintenant.getSeconds().toString()
          : maintenant.getSeconds();

      this.ws.send(
        JSON.stringify({
          op: 3,
          d: {
            status: "online",
            since: 0,
            activities: [
              {
                name: "Custom Status",
                type: 4,
                state: ` ${hours}:${minutes}:${seconds}`,
                timestamps: {
                  end: 1702076400000,
                },
                emoji: {
                  id: null,
                  name: "⏲️",
                  animated: false,
                },
              },
            ],
            afk: false,
          },
        })
      );
    };

    setInterval(sendHour, 2000);
  }

  async sendMessage(
    content: string,
    channel_id: string,
    referenced_message?: any
  ) {
    const body =
      referenced_message == undefined
        ? {
            mobile_network_type: "unknown",
            content: content,
            nonce: Math.floor(
              Math.random() * (10000000 - 100 + 1) + 100
            ).toString(),
            tts: false,
            flags: 0,
          }
        : {
            mobile_network_type: "unknown",
            content: content,
            nonce: Math.floor(
              Math.random() * (10000000 - 100 + 1) + 100
            ).toString(),
            tts: false,
            flags: 0,
            message_reference: referenced_message,
          };

    const response = await axios.post(
      `https://discord.com/api/v9/channels/${channel_id}/messages`,
      body,
      {
        headers: this.headers,
      }
    );
  }

  async editMessage(
    channel_id: string,
    message_id: string,
    new_message: string
  ) {
    const response = await axios.patch(
      `https://discord.com/api/v9/channels/${channel_id}/messages/${message_id}`,
      {
        content: new_message,
      },
      {
        headers: this.headers,
      }
    );
  }

  async getInfoUser() {
    const response = await axios.get(
      "https://canary.discordapp.com/api/v9/users/@me",
      {
        headers: this.headers,
      }
    );
  }

  async get_history_discord_message(
    guild_id: string,
    my_id: string,
    limit: string = "10"
  ) {
    const response = await axios.get(
      `https://discord.com/api/v9/channels/${guild_id}/messages`,
      {
        params: {
          limit: limit,
        },
        headers: this.headers,
      }
    );

    //console.log(response.data);

    const messages = response.data.slice().reverse();
    let formated_history = [];
    let formated_history2 = "";

    //console.log(messages);
    for (let message of messages) {
      const { author } = message;

      if (message.type == 0 || message.type == 19) {
        formated_history2 += author.username + ": " + message.content + "\n";

        formated_history.push({
          [author.username]: message.content,
        });
      }
    }
    return formated_history2;
    //return JSON.stringify(formated_history);
  }
  async delete_message(channel_id: string, message_id: string) {
    const response = await axios.delete(
      `https://discord.com/api/v9/channels/${channel_id}/messages/${message_id}`,
      {
        headers: this.headers,
      }
    );
  }
}

export default DiscordClient;
