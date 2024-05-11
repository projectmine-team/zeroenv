# ZEROENV
An easy command-line tool to manage "environment variables" for you Minecraft server. Basically, all what it does, just populates properties from .env file to your plugins configs, defined in separate .json file.

## Installation
You can pull this repo, install dependencies, run `npm run build` script and then `npm run install`. This will install the tool into your system and it will be available via `zeroenv` command.

Or you can just download the latest release, which is a standalone executable, and use it anywhere and everywhere you want. You can also use that executable on your server or in the Docker container environment, however that file weighs a lot (almost 100MB).

## Configuration
Firstly, create a file called `.env` and populate it with any options you want. Example:

```properties
DB_HOSTNAME=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=toor
DB_DATABASE=my_gigaserver_db
```

And yes, you absolutely should NOT store this file with a production credentials in git repo.

Second, you should create a file called `env.targets.json` in the root directory of your server. It will be used to define the configs properties that need to be replaced.

That file consists from a list of dictionaries like this:

```json
[
    {
        "file": "path/to/plugin/config.yml",
        "parser": "yaml", // "yaml" | "json" | "properties" (WIP) | "ini" (WIP)
        "replace": {
            "database.hostname": "{{DB_HOSTNAME}}:{{DB_PORT}}",
            "database.user": "{{DB_USERNAME}}",
            "database.password": "{{DB_PASSWORD}}",
            "database.database": "{{DB_DATABASE}}"
        }
    },
    {
        "file": "plugins/skinsrestorer/config.yml",
        "parser": "yaml",
        "replace": {
            "database.host": "{{DB_HOSTNAME}}",
            "database.port": "{{DB_PORT}}",
            "database.database": "{{DB_DATABASE}}",
            "database.username": "{{DB_USERNAME}}",
            "database.password": "{{DB_PASSWORD}}",
            "invalid.property": "{{SOME_ENV_VAR}}" // will be ignored by zeroenv
        }
    },
    ...
]
```

Explanation: `file` - path to the plugin configuration; `parser` - in which format the config is stored; `replace` - options in that config to replace with corresponding variables from `.env` file, encased to `{{` and `}}` template.

This file can be stored alongside with the server files in git repo or any other place you decide.

After those steps, you're finally free to use zeroenv. Execute it from the root directory of your Minecraft server by just typing `zeroenv`. This will populate previously defined configs properties with corresponding environment variables. The program will show you a results and errors occured during configuration. Make sure to backup you configs before, however, zeroenv should not mess it up.

If you want to remove those properties from configs (e.g. you want to commit changes to a git repo), consider typing `zeroenv --clean`. This action will replace all properties with their corresponding templates, e.g. `{{DB_HOSTNAME}}:{{DB_PORT}}` instead of `127.0.0.1:3306`. You can store configs in that form for convenience.

By default, zeroenv reads `.env` and `env.targets.json` from a server's root directory, but you can specify custom pathes by using `--env` and `--targets` args correspondingly.

## Honorable mention
The name of this project consists from two parts: **zero**, which means zero-configuration, and **env**, which means environment variables.

For your information, this program is not a zero-configuration software by reason that you must configure it first to make it work, and this program does not work with your system's environment.

## License and contribution
You can fork this repo freely. You can distribute the standalone executable anywhere you want without asking, but no one will beleive you that's not a malware, so consider sharing a link to this repo instead.

You're free to help me develop this piece of software by a contribution.