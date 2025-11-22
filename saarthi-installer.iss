; Saarthi Desktop App - Professional Installer Script
; Created with Inno Setup

#ifndef MyAppName
  #define MyAppName "Sartthi"
#endif

#ifndef MyAppVersion
  #define MyAppVersion "1.0.0"
#endif

#ifndef MyAppPublisher
  #define MyAppPublisher "Yash Borude"
#endif

#ifndef MyAppURL
  #define MyAppURL "https://github.com/borudeyash1"
#endif

#ifndef MyAppExeName
  #define MyAppExeName "Saarthi.vbs"
#endif

[Setup]
; App Information
AppId={{8F9A2B3C-4D5E-6F7A-8B9C-0D1E2F3A4B5C}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Installation Directories
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; Output
OutputDir=dist
OutputBaseFilename={#MyAppName}-Setup-{#MyAppVersion}
Compression=lzma
SolidCompression=yes

; Privileges
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog

; UI
WizardStyle=modern

; Uninstall
UninstallDisplayIcon={app}\logo_only.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
; Copy all app files
Source: "dist\saarthi-app\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Start Menu
Name: "{group}\{#MyAppName}"; Filename: "wscript.exe"; Parameters: """{app}\{#MyAppExeName}"""; WorkingDir: "{app}"; IconFilename: "{app}\logo_only.ico"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"

; Desktop
Name: "{autodesktop}\{#MyAppName}"; Filename: "wscript.exe"; Parameters: """{app}\{#MyAppExeName}"""; WorkingDir: "{app}"; IconFilename: "{app}\logo_only.ico"; Tasks: desktopicon

[Run]
; Launch app after installation
Filename: "wscript.exe"; Parameters: """{app}\{#MyAppExeName}"""; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
// Custom installation messages
procedure InitializeWizard();
begin
  WizardForm.WelcomeLabel2.Caption := 
    'This will install {#MyAppName} on your computer.' + #13#10 + #13#10 +
    '{#MyAppName} helps you manage projects, tasks, and teams efficiently.' + #13#10 + #13#10 +
    'Click Next to continue, or Cancel to exit Setup.';
end;

// Check if Node.js is installed
function NodeJSInstalled(): Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec('cmd.exe', '/c node --version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

// Post-installation: Install Electron
procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
begin
  if CurStep = ssPostInstall then
  begin
    // Install Electron dependencies
    if NodeJSInstalled() then
    begin
      Exec('cmd.exe', '/c cd "' + ExpandConstant('{app}') + '" && npm install electron --save-dev', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    end;
  end;
end;
