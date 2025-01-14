Here’s the markdown code for the README file:

```markdown
# Discord Control Bot

This project is a **TypeScript application** designed to take control of a Discord account and interact with contacts either through direct messages (DMs) or within servers.

## Features

- Log in to a Discord account using a token.
- Interact with users via DMs or in server channels.
- Configure target users for interaction via a configuration file.
- Powered by **OpenAI** for enhanced conversational capabilities.

## Prerequisites

Before running the project, ensure you have the following:

- **Node.js** installed (v14+ recommended).
- A valid **Discord token** and **OpenAI API key**.

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the application:

   - Open the `config.json` file located in the project root.
   - Add your **Discord token** and **OpenAI API key** in the respective fields.
   - Specify the users the bot can interact with under the `targets` object:

     ```json
     {
       "token": "your-discord-token-here",
       "openai_token": "your-openai-api-key-here",
       "targets": [
        {
            "user_name": "petitastre",
            "user_id": "586990875150909440",
            "reply": {
            "time_to_reply": null
            }
        },
        {
        "user_name": "sully_bjork",
        "user_id": "1157033077441314867",
        "reply": {
            "time_to_reply": null
        },
        "prompt": "[ONLY JSON] the structure of the JSON must be {'response' : 'response content'} YOUR PROMPT "
    },
       ]
     }
     ```

## Running the Application

To start the application, use one of the following commands:

- With **npm**:

  ```bash
  npm start
  ```

- With **npx**:

  ```bash
  npx ts-node src/index.ts
  ```

## Notes

- **Account Safety**: Be cautious when using your Discord token. Never share it publicly to avoid unauthorized access to your account.
- **Target Configuration**: The bot will only interact with users specified in the `targets` list in `config.json`. Ensure you list the correct user IDs.
- **Dependencies**: This project uses libraries such as `discord.js` and `openai`. Refer to the `package.json` for a full list of dependencies.

## Future Improvements

- Add support for custom commands.
- Enhance logging and error handling.
- Introduce a GUI for easier configuration.

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
```