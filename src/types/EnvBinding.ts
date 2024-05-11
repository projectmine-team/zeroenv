interface EnvBinding {
    file: string
    parser: "yaml" | "json" | "properties" | "ini"
    replace: {
        [key: string]: string
    }
}

export default EnvBinding