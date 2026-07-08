export function buildPrompt(template: string, inputs: Record<string, string>): string {
  let prompt = template;
  for (const [key, value] of Object.entries(inputs)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    prompt = prompt.replace(regex, value);
  }
  return prompt;
}
