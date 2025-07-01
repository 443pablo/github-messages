export class Extension {
  browser: any;

  constructor() {
    this.browser = window.browser || window.chrome;
  }

  async init(): Promise<void> {
    const b = this.browser;
    if (!b) {
      console.warn("what are you doing running this as a userscript?? ok lol");
      return;
    }
  }

  async getNotificationPermission(): Promise<boolean> {
    const b = this.browser;
    return new Promise((resolve, reject) => {
      if (!b.permissions || !b.permissions.contains) {
        resolve(false);
        return;
      }
      b.permissions.contains(
        {
          permissions: ["notifications"],
          origins: ["https://github.com/"],
        },
        (result: boolean) => {
          resolve(result);
        }
      );
    });
  }

  async requestNotificationPermission(): Promise<boolean> {
    const b = this.browser;

    if (b.permissions && b.permissions.request) {
      try {
        return new Promise(async (resolve, reject) => {
          await b.permissions.request(
            {
              permissions: ["notifications"],
              origins: ["https://github.com/"],
            },
            (result: boolean) => {
              resolve(result);
            }
          );
        });
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        return false;
      }
    } else {
      console.warn("Notifications API not available.");
      return false;
    }
  }

  async revokeNotificationPermission(): Promise<boolean> {
    const b = this.browser;

    if (b.permissions && b.permissions.remove) {
      return new Promise(async (resolve, reject) => {
        try {
          await b.permissions.remove(
            {
              permissions: ["notifications"],
              origins: ["https://github.com/"],
            },
            (result: boolean) => {
              resolve(result);
            }
          );
        } catch (error) {
          console.error("Error revoking notification permission:", error);
          resolve(false);
        }
      });
    } else {
      return false;
    }
  }
}
