# Building Lynx Explorer for iOS (Real Device)

## Context

Lynx Explorer is the official sandbox app for previewing and testing Lynx bundles on-device. During
development you run `npm run demo` (or `rspeedy dev`), which starts a local dev server and prints a
QR code in the terminal. Lynx Explorer scans that QR code, fetches the bundle from the dev server,
and renders it natively using the Lynx runtime.

Pre-built simulator binaries (`LynxExplorer-arm64.app.tar.gz`) are distributed with each GitHub
release and work fine for testing in the iOS Simulator. **Real-device deployment requires building
from source**, because Apple's code-signing rules require the binary to be signed with your own
developer identity.

There is also a community-maintained App Store version
([Lynx Go Dev Explorer, ID 6743227790](https://apps.apple.com/us/app/lynx-go-dev-explorer/id6743227790))
that the Lynx team does not maintain — use it as a fallback if source builds become blocked.

---

## Prerequisites

| Requirement                  | Minimum version | Notes                                                            |
| ---------------------------- | --------------- | ---------------------------------------------------------------- |
| Mac (Apple Silicon or Intel) | —               | Xcode only runs on macOS                                         |
| Xcode                        | Latest stable   | Install from the Mac App Store                                   |
| Ruby                         | 2.6.10+         | macOS ships one; use `rbenv` or `rvm` for version control        |
| CocoaPods                    | 1.11.3+         | `sudo gem install cocoapods`                                     |
| Apple Developer account      | Free or paid    | Free account allows 7-day device installs; paid allows unlimited |
| iOS device                   | iOS 10.0+       | Minimum supported by Lynx                                        |

### Install CocoaPods (if not already present)

```bash
sudo gem install cocoapods
pod --version   # verify >= 1.11.3
```

---

## Step 1 — Clone the Lynx monorepo

The Lynx Explorer iOS source lives inside the main `lynx-family/lynx` repository. The full
repository is large, so use a shallow clone targeting the `develop` branch (which tracks the latest
SDK).

```bash
git clone --depth=1 --branch develop https://github.com/lynx-family/lynx.git
cd lynx
```

The iOS Explorer project is at:

```
lynx/explorer/darwin/ios/
```

> **Note:** The `develop` branch corresponds to SDK version `next`. If you want to pin to the
> stable 3.7.0 release (matching the CocoaPod versions below), clone the `release/3.7` branch
> instead:
>
> ```bash
> git clone --depth=1 --branch release/3.7 https://github.com/lynx-family/lynx.git
> ```

---

## Step 2 — Install CocoaPods dependencies

```bash
cd explorer/darwin/ios
pod install
```

This reads the project `Podfile` and installs all Lynx runtime pods. The expected pods at Lynx
3.7.0 are:

```ruby
platform :ios, '10.0'

target 'LynxExplorer' do
  pod 'Lynx', '3.7.0', :subspecs => ['Framework']
  pod 'PrimJS', '3.7.0', :subspecs => ['quickjs', 'napi']

  pod 'LynxService', '3.7.0', :subspecs => ['Image', 'Log', 'Http']
  pod 'SDWebImage', '5.15.5'
  pod 'SDWebImageWebPCoder', '0.11.0'

  pod 'XElement', '3.7.0'
end
```

If `pod install` fails with a version-not-found error, check the latest published version at
[github.com/lynx-family/lynx/releases](https://github.com/lynx-family/lynx/releases) and update
the version strings in `Podfile` accordingly.

---

## Step 3 — Open the Xcode workspace

Always open the `.xcworkspace` file (not `.xcodeproj`) after `pod install`:

```bash
open LynxExplorer.xcworkspace
```

---

## Step 4 — Disable User Script Sandboxing

Lynx's build scripts require shell access that Xcode's sandboxing blocks by default.

1. In Xcode, select the **LynxExplorer** target in the project navigator.
2. Go to **Build Settings**.
3. Search for **"script"**.
4. Set **User Script Sandboxing** to **`No`**.

If you skip this step the build will fail with a permission error during the script phase.

---

## Step 5 — Configure code signing

1. In Xcode, select the **LynxExplorer** target → **Signing & Capabilities** tab.
2. Check **Automatically manage signing**.
3. Select your **Team** (your Apple ID / developer account).
4. Xcode will generate a provisioning profile automatically.

For a free Apple ID, the provisioning profile expires after 7 days and must be re-signed. A paid
Apple Developer Program membership ($99/year) removes this restriction.

---

## Step 6 — Select your device and build

1. Connect your iPhone via USB. Trust the Mac on the device when prompted.
2. In the Xcode toolbar, select your physical device from the scheme dropdown (not a simulator).
3. Press **⌘R** (or **Product → Run**) to build and install.

The build compiles the Lynx C++ runtime (via the CocoaPod's pre-compiled framework), links
everything, signs the app, and installs it on your device. Expect 2–5 minutes on first build.

---

## Step 7 — Trust the developer certificate on-device

Because you are sideloading (not distributing through the App Store):

1. On your iPhone, go to **Settings → General → VPN & Device Management**.
2. Find your Apple ID under **Developer App**.
3. Tap **Trust "[Your Name]"** → **Trust**.

You only need to do this once per signing certificate (or once every 7 days with a free account).

---

## Step 8 — Use Lynx Explorer

### Scanning the dev server QR code

1. Start your AngularLynx dev server:

   ```bash
   npm run demo
   ```

   A QR code will appear in the terminal.

2. Open Lynx Explorer on your iPhone.
3. Tap the **Scan** button and point the camera at the terminal QR code.
4. Lynx Explorer fetches the bundle from your Mac's dev server and renders it.

> **Network requirement:** Your iPhone must be on the same Wi-Fi network as your Mac. The dev
> server binds to your local IP (not `localhost`), so the bundle URL in the QR code is already
> correct.

### Entering a URL manually

If QR scanning doesn't work:

1. Find the dev server URL printed in the terminal (e.g. `http://192.168.1.42:3000/main.lynx.bundle`).
2. In Lynx Explorer, tap **"Enter Card URL"**, paste the URL, tap **Go**.

### Hot reload

Lynx Explorer supports hot reload. When you save a file, rspeedy rebuilds the bundle and Lynx
Explorer auto-reloads — no need to re-scan.

---

## Optional: Enable DevTool for debugging

The default Explorer build does not include the Lynx DevTool. To connect the
[Lynx DevTool desktop app](https://github.com/lynx-family/lynx-devtool/releases) over USB, add
DevTool to the Podfile and enable it in the app delegate.

### 1. Add DevTool pods

```ruby
target 'LynxExplorer' do
  # ... existing pods ...

  pod 'LynxService', '3.7.0', :subspecs => ['Image', 'Log', 'Http', 'Devtool']
  pod 'LynxDevtool', '3.7.0'
  pod 'DebugRouter', '5.0.15'
  pod 'DebugRouter/MessageTransceiverEnable', '5.0.15'
end
```

Run `pod install` again after editing the Podfile.

### 2. Enable DevTool in AppDelegate

Find the Explorer's `AppDelegate.m` (or `.swift`) and add the DevTool switches after
`[LynxEnv sharedInstance]`:

**Objective-C:**

```objc
#import <Lynx/LynxEnv.h>
#import <Lynx/LynxService.h>
#import <Lynx/LynxServiceDevToolProtocol.h>

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  LynxEnv *lynxEnv = [LynxEnv sharedInstance];

  // Required for Lynx DevTool Desktop USB connection
  [LynxService(LynxServiceDevToolProtocol) enableAllSessions];
  lynxEnv.lynxDebugEnabled = YES;
  lynxEnv.devtoolEnabled = YES;
  [LynxService(LynxServiceDevToolProtocol) setLogBoxPresetValue:YES];
  lynxEnv.logBoxEnabled = YES;

  return YES;
}
```

**Swift:**

```swift
import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
  func application(_ application: UIApplication,
      didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    let lynxEnv = LynxEnv.sharedInstance()

    let devtool = LynxServices.getInstanceWith(
      LynxServiceDevToolProtocol.self, bizID: DEFAULT_LYNX_SERVICE
    ) as? LynxServiceDevToolProtocol
    devtool?.enableAllSessions()

    lynxEnv.lynxDebugEnabled = true
    lynxEnv.devtoolEnabled = true
    devtool?.logBoxPresetValue = true
    lynxEnv.logBoxEnabled = true

    return true
  }
}
```

### 3. Connect DevTool

1. Download and open **Lynx DevTool Desktop** from
   [github.com/lynx-family/lynx-devtool/releases](https://github.com/lynx-family/lynx-devtool/releases).
2. Connect your iPhone to your Mac via USB.
3. Open Lynx Explorer on the device — DevTool Desktop should detect the session automatically.

---

## Troubleshooting

### `pod install` fails with "Unable to find a specification for..."

The requested CocoaPod version does not exist in the registry yet. Check the latest published
version at [github.com/lynx-family/lynx/releases](https://github.com/lynx-family/lynx/releases)
and update version strings in the Podfile.

### Build fails: "Sandbox: rsync ... denied"

You forgot to set **User Script Sandboxing = No** (Step 4). Set it and clean the build
(**Product → Clean Build Folder**, ⇧⌘K).

### "Unable to install application" / device not trusted

Complete Step 7 (trusting the developer certificate on the device). With a free Apple ID, you must
redo this every 7 days.

### App launches but QR scan doesn't load the bundle

- Confirm iPhone and Mac are on the same Wi-Fi network.
- Check that your Mac's firewall isn't blocking the rspeedy dev server port (default 3000).
- Try entering the URL manually (Step 8, "Entering a URL manually").

### Error toasts persist after fixing a bug

Lynx Explorer error toasts are sticky across page navigations. **Force-quit and reopen the app** to
clear stale errors. This is a known Lynx Explorer quirk documented in the vue-lynx codebase.

### Free Apple ID: app stops working after 7 days

Re-open the `.xcworkspace` in Xcode, connect the device, and press **⌘R** to re-sign and reinstall.
Consider a paid Apple Developer Program membership to avoid this.
