import { getProperties } from "properties-file";
import EnvBinding from "./types/EnvBinding";
import YAML from "yaml"

export function unmarshal(value: string | Buffer, parser: EnvBinding["parser"]) {
    if (value instanceof Buffer) {
        value = value.toString()
    }
    
    if (parser === "yaml") return YAML.parse(value)
    if (parser === "json") return JSON.parse(value)
    if (parser === "properties") return getProperties(value)
}

export function marshal(value: any, parser: EnvBinding["parser"]) {
    if (parser === "yaml") return YAML.stringify(value)
    if (parser === "json") return JSON.stringify(value, null, "\t")
    // if (parser === "properties") return getProperties(value)
}