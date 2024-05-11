#!/usr/bin/env node

const time = performance.now()

import fs from "node:fs"
import EnvBinding from "./types/EnvBinding";
import Mustache from "mustache"
import chalk from "chalk";
import { marshal, unmarshal } from "./parser";
import _ from "lodash";
import trimTemplateString from "./trim"
import arg from "arg"

function main() {
    const args = arg({
        "--env": String,
        "--targets": String,
        "--clean": arg.COUNT
    })

    console.log(chalk.cyanBright.bold("      | __  ___  __   __   ___           "))
    console.log(chalk.cyanBright.bold("      |  / |__  |__) /  \\ |__  |\\ | \\  / "))
    console.log(chalk.cyanBright.bold("      | /_ |___ |  \\ \\__/ |___ | \\|  \\/  "))
    console.log(chalk.cyanBright.bold("      |"))

    let envFile, targetsFile;

    try {
        envFile = fs.readFileSync(args["--env"] ?? ".env")
    } catch {
        console.error(chalk.red(`FATAL | Cannot open environment file`))

        return
    }
    
    try {
        targetsFile = fs.readFileSync(args["--targets"] ?? "env.targets.json")
    } catch {
        console.error(chalk.red(`FATAL | Cannot open environment targets file`))

        return
    }

    const env = unmarshal(envFile, "properties")
    const targets = unmarshal(targetsFile, "json") as EnvBinding[]
    
    let propertiesPopulated = 0;
    let propertiesIgnored = 0;
    let propertiesErrored = 0;
    let filesModified = 0;
    let filesErrored = 0;

    for (const [i, target] of targets.entries()) {
        let configRaw: Buffer

        try {
            configRaw = fs.readFileSync(target.file)
        } catch {
            console.error(chalk.red(`ERROR | Cannot open ${target.file}`))

            filesErrored++
            continue
        }

        const config = unmarshal(configRaw, target.parser)

        for (const [path, valueReplacementRaw] of Object.entries(target.replace)) {
            const valueCurrent = _.get(config, path)
            const valueReplacement = Mustache.render(valueReplacementRaw, env)

            if (valueCurrent === undefined) {
                console.error(chalk.yellow(`WARN  | Invalid property: ${target.file}/${path}. Ignoring`))

                propertiesErrored++;
                continue;
            }

            if (args["--clean"]) {
                _.set(config, path, valueReplacementRaw)

                console.info(`INFO  | Defaulting: ${target.file}/${path} -> ${valueReplacementRaw}`)

                propertiesPopulated++
                continue
            }

            if (valueCurrent == valueReplacement) {
                console.info(`INFO  | Ignored: ${target.file}/${path} -> ${trimTemplateString(valueReplacementRaw)}. Already present`)

                propertiesIgnored++
                continue
            }

            _.set(config, path, valueReplacement)

            console.info(`INFO  | Updated: ${target.file}/${path} -> ${trimTemplateString(valueReplacementRaw)}`)

            propertiesPopulated++
        }

        const configNew = marshal(config, target.parser)

        fs.writeFileSync(target.file, String(configNew))

        console.info(chalk.green(`OK    | File saved: ${target.file}`))

        filesModified++;
    }

    console.log(chalk.green(`OK    | Completed! Here's some stats:`))
    console.log(`      |`)
    console.log(chalk.cyan(`      | ${propertiesPopulated} properties populated`))
    console.log(chalk.cyan(`      | ${propertiesIgnored} properties ignored`))
    console.log(chalk.cyan(`      | ${propertiesErrored} invalidated properties, thus ignored`))
    console.log(chalk.cyan(`      | ${filesModified} files modified`))
    console.log(chalk.cyan(`      | ${filesErrored} files errored`))
    console.log(chalk.cyan(`      | ${Number(performance.now() - time).toFixed(2)}ms configuration took`))
}

main();