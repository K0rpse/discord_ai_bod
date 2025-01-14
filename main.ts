const configFiles = require("./config.json");
import DiscordClient from "./src/discord";
import get_gpt_response from "./src/openai";
import fs from "fs";

const TOKEN = configFiles.token;
//token_discord2=sully
//token=ismail
const OPENAI_TOKEN = configFiles.openai_token;
const TARGETS = configFiles.targets;

async function executeAtDate(date: Date, callback: any, ...args) {
  const currentDate = new Date().getTime() + 2 * 60 * 60 * 1000;
  const targetDate = new Date(date);
  const timeDifference = targetDate.getTime() - currentDate;

  console.log(timeDifference);

  if (timeDifference <= 0) {
    // If the target date has already passed, execute the callback immediately
    callback(...args);
  } else {
    // Schedule the callback to be executed at the target date
    setTimeout(() => callback(...args), timeDifference);
  }

  console.log("Scheduling FOR " + timeDifference);
}

async function reply(client, event_message) {
  //console.log("REPLYING");
  let { referenced_message, id, content, channel_id, author } = event_message;
  let history_message = await client.get_history_discord_message(
    channel_id,
    configFiles.master_discord_id
  );

  const target = TARGETS.find((user: any) => user.user_name === author.username);

  // Vérifier si l'attribut `prompt` est présent, sinon, définir un prompt par défaut
  const defaultPrompt = "[ONLY JSON] the structure of the JSON must be {'response' : 'response content'} tu es un jeune, ton nom est " + configFiles.master_pseudo + ", répond comme un jeune en utilisant l'argo: ";

  const prompt = target?.prompt || defaultPrompt;

  console.log("history message: " + history_message);

  let response: string = await get_gpt_response(
    OPENAI_TOKEN,
    configFiles.master_pseudo,
    history_message,
    prompt
  );

  console.log("GPT response: " + response);


  try {
    response = JSON.parse(response).response + " (ai content)";
  } catch (err) {
    response = "Une erreur est survenu...";
  }

  //console.log("response: " + response);

  client.sendMessage(response, channel_id, {
    guild_id: event_message.guild_id,
    channel_id: event_message.channel_id,
    message_id: event_message.id,
  });

  for (const target of TARGETS) {
    //console.log(author);
    if (target.user_name == author.username) {
      target.reply.time_to_reply = null;
      break;
    }
  }
  // Save the updated TARGETS back to the config file if needed
  fs.writeFileSync("./config.json", JSON.stringify(configFiles, null, 2));
}

async function main() {
  const client = new DiscordClient(TOKEN);

  client.on("READY", async (username: string) => {
    console.log(`Logged as ${username}`);
  });

  client.on("MESSAGE_CREATE", async (event_message: any) => {
    //only in dm
    let { referenced_message, id, content, channel_id, author } = event_message;
    //console.log(event_message);
    if (author.id != configFiles.master_discord_id) {
      for (const target of TARGETS) {
        if (target.user_name == author.username) {
          //console.log(content);

          if (content.startsWith("/ai")) {
            if (target.reply.time_to_reply == null) {
              const date_reply =
                new Date().getTime() + 1 * 60 * 60 * 1000 + 1 * 3 * 1000;
              target.reply.time_to_reply = date_reply;
              //console.log("executeADate");
              await executeAtDate(
                new Date(date_reply),
                reply,
                client,
                event_message
              );
            }
            break;
          }
        }
      }
      fs.writeFileSync("./config.json", JSON.stringify(configFiles, null, 2));
    }
    //}
  });

  client.on("close", () => {
    console.log("disconnected from server");
  });
}

main();
