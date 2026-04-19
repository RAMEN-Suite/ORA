export class Utils {
  public static async sleep(seconds: number): Promise<void> {
    await new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, seconds * 1000));
  }
}
