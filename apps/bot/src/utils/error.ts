export class ErrorWithReaction extends Error {
  public emoji: string;

  constructor(emoji: string, message: string) {
    super(message);
    this.emoji = emoji;
  }
}
