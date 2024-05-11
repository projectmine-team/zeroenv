function trimTemplateString(value: string) {
    return value.replace(/{{|}}/gm, "")
}

export default trimTemplateString