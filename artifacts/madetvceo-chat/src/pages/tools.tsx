import { useState, useRef, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  FolderOpen, Trash2, RefreshCw, AlertTriangle, CheckCircle2,
  Copy, Terminal, Monitor, Apple, Cpu, FileText, HardDrive,
  Search, FolderTree, Zap, Shield, Clock, MemoryStick, Wifi
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileEntry {
  name: string;
  path: string;
  size: number;
  kind: "file" | "directory";
  type: string;
  handle?: FileSystemFileHandle;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileCategory(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg","jpeg","png","gif","webp","svg","bmp","ico","tiff"].includes(ext)) return "Image";
  if (["mp4","mov","avi","mkv","webm","flv","wmv"].includes(ext)) return "Video";
  if (["mp3","wav","flac","aac","ogg","m4a"].includes(ext)) return "Audio";
  if (["pdf","doc","docx","xls","xlsx","ppt","pptx","txt","rtf","odt"].includes(ext)) return "Document";
  if (["zip","rar","7z","tar","gz","bz2"].includes(ext)) return "Archive";
  if (["js","ts","jsx","tsx","py","java","cpp","c","cs","go","rs","php","rb","swift"].includes(ext)) return "Code";
  if (["tmp","temp","log","bak","old","cache"].includes(ext)) return "Junk";
  if (ext === "") return "Directory";
  return "Other";
}

const SCRIPTS = {
  windows: [
    {
      id: "disk-cleanup",
      title: "Disk Cleanup",
      icon: HardDrive,
      description: "Clears Temp files, Windows Update cache, Recycle Bin, and thumbnails. Run in PowerShell as Administrator.",
      script: `# Made Super AI — Windows Disk Cleanup
# Run in PowerShell as Administrator

Write-Host "Starting disk cleanup..." -ForegroundColor Cyan

# Clear Temp folder
Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Cleared user Temp folder" -ForegroundColor Green

# Clear Windows Temp
Remove-Item "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Cleared Windows Temp folder" -ForegroundColor Green

# Clear Prefetch
Remove-Item "C:\\Windows\\Prefetch\\*" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Cleared Prefetch" -ForegroundColor Green

# Run built-in Disk Cleanup silently
cleanmgr /sagerun:1 | Out-Null

# Empty Recycle Bin
Clear-RecycleBin -Force -ErrorAction SilentlyContinue
Write-Host "Emptied Recycle Bin" -ForegroundColor Green

Write-Host "\\nDisk cleanup complete!" -ForegroundColor Cyan`,
    },
    {
      id: "browser-cache",
      title: "Clear Browser Caches",
      icon: Wifi,
      description: "Clears Chrome, Edge, and Firefox cache folders to free up disk space.",
      script: `# Made Super AI — Clear Browser Caches
# Close all browsers first, then run in PowerShell

$user = $env:LOCALAPPDATA

# Chrome Cache
$chromePath = "$user\\Google\\Chrome\\User Data\\Default\\Cache"
if (Test-Path $chromePath) {
  Remove-Item "$chromePath\\*" -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "Cleared Chrome cache" -ForegroundColor Green
}

# Edge Cache
$edgePath = "$user\\Microsoft\\Edge\\User Data\\Default\\Cache"
if (Test-Path $edgePath) {
  Remove-Item "$edgePath\\*" -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "Cleared Edge cache" -ForegroundColor Green
}

# Firefox Cache
$firefoxPath = "$env:APPDATA\\Mozilla\\Firefox\\Profiles"
if (Test-Path $firefoxPath) {
  Get-ChildItem $firefoxPath -Recurse -Directory -Filter "cache2" | ForEach-Object {
    Remove-Item "$($_.FullName)\\*" -Recurse -Force -ErrorAction SilentlyContinue
  }
  Write-Host "Cleared Firefox cache" -ForegroundColor Green
}

Write-Host "\\nAll browser caches cleared!" -ForegroundColor Cyan`,
    },
    {
      id: "startup-items",
      title: "List Startup Programs",
      icon: Clock,
      description: "Shows all programs that launch at startup — copy the names of ones you want to remove.",
      script: `# Made Super AI — View & Manage Startup Programs
# Run in PowerShell

Write-Host "=== STARTUP PROGRAMS ===" -ForegroundColor Cyan
Write-Host ""

# Current User Run key
Write-Host "--- Current User Startups ---" -ForegroundColor Yellow
Get-ItemProperty "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" | 
  Select-Object -Property * -ExcludeProperty PS* | 
  Format-List

Write-Host "--- All Users Startups ---" -ForegroundColor Yellow
Get-ItemProperty "HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" | 
  Select-Object -Property * -ExcludeProperty PS* | 
  Format-List

Write-Host "--- Task Scheduler Startups ---" -ForegroundColor Yellow
Get-ScheduledTask | Where-Object { $_.Triggers.CimClass.CimClassName -eq "MSFT_TaskLogonTrigger" } | 
  Select-Object TaskName, TaskPath | Format-Table -AutoSize

Write-Host "\\nTo disable a startup item, open Task Manager > Startup tab" -ForegroundColor Green`,
    },
    {
      id: "ram-optimize",
      title: "RAM & Memory Optimization",
      icon: MemoryStick,
      description: "Shows memory usage, top memory-hungry processes, and flushes standby memory.",
      script: `# Made Super AI — Memory Optimization
# Run in PowerShell as Administrator

Write-Host "=== MEMORY STATUS ===" -ForegroundColor Cyan

# Show total/available RAM
$os = Get-CimInstance Win32_OperatingSystem
$totalRAM = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
$freeRAM  = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
$usedRAM  = [math]::Round($totalRAM - $freeRAM, 2)
Write-Host "Total RAM: \${totalRAM} GB | Used: \${usedRAM} GB | Free: \${freeRAM} GB" -ForegroundColor White

# Top 10 memory-hungry processes
Write-Host "\\n=== TOP MEMORY CONSUMERS ===" -ForegroundColor Yellow
Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 |
  Format-Table Name, @{N="RAM (MB)";E={[math]::Round($_.WorkingSet64/1MB,1)}}, CPU -AutoSize

# Flush DNS
ipconfig /flushdns | Out-Null
Write-Host "\\nFlushed DNS cache" -ForegroundColor Green

Write-Host "\\nDone. Restart any heavy apps to free memory." -ForegroundColor Cyan`,
    },
    {
      id: "system-scan",
      title: "System File Repair (SFC)",
      icon: Shield,
      description: "Runs Windows built-in System File Checker to find and repair corrupted system files.",
      script: `# Made Super AI — System File Checker & DISM Repair
# MUST run in PowerShell as Administrator

Write-Host "Starting System File Check — this may take 5-10 minutes..." -ForegroundColor Cyan
Write-Host "Do not close this window." -ForegroundColor Yellow
Write-Host ""

# Run DISM first to repair Windows image
Write-Host "Step 1: Repairing Windows image with DISM..." -ForegroundColor White
DISM /Online /Cleanup-Image /RestoreHealth

Write-Host ""
Write-Host "Step 2: Running System File Checker (SFC)..." -ForegroundColor White
sfc /scannow

Write-Host ""
Write-Host "Scan complete! If issues were found, restart your PC and run again." -ForegroundColor Green`,
    },
    {
      id: "find-large",
      title: "Find Large Files",
      icon: Search,
      description: "Scans your C: drive and lists the 25 largest files so you can decide what to delete.",
      script: `# Made Super AI — Find Large Files on C: Drive
# Run in PowerShell (takes ~2 minutes to scan)

Write-Host "Scanning C: drive for large files..." -ForegroundColor Cyan

Get-PSDrive C | Out-Null
Get-ChildItem "C:\\" -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Length -gt 100MB } |
  Sort-Object Length -Descending |
  Select-Object -First 25 |
  Format-Table @{N="Size";E={"{0:N0} MB" -f ($_.Length/1MB)}}, FullName -AutoSize

Write-Host "\\nThese are your largest files. Review before deleting!" -ForegroundColor Yellow`,
    },
  ],
  mac: [
    {
      id: "disk-cleanup-mac",
      title: "Disk Cleanup",
      icon: HardDrive,
      description: "Clears system caches, logs, Trash, and Homebrew leftovers.",
      script: `#!/bin/bash
# Made Super AI — macOS Disk Cleanup
# Run in Terminal

echo "Starting macOS cleanup..."

# Clear user caches
rm -rf ~/Library/Caches/*
echo "Cleared user caches"

# Clear system logs
sudo rm -rf /private/var/log/*
echo "Cleared system logs"

# Clear sleep image (can be large)
sudo rm -rf /private/var/vm/sleepimage
echo "Removed sleep image"

# Empty Trash
rm -rf ~/.Trash/*
echo "Emptied Trash"

# Homebrew cleanup (if installed)
if command -v brew &>/dev/null; then
  brew cleanup --prune=all
  brew autoremove
  echo "Cleaned Homebrew"
fi

# Clear DNS cache
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
echo "Flushed DNS cache"

echo ""
echo "macOS cleanup complete!"`,
    },
    {
      id: "find-large-mac",
      title: "Find Large Files",
      icon: Search,
      description: "Lists the 20 largest files on your Mac to help free up space.",
      script: `#!/bin/bash
# Made Super AI — Find Large Files on Mac

echo "Scanning for large files (>100MB)..."
echo ""

sudo find / -not \\( -path /Volumes -prune \\) -not \\( -path /System -prune \\) \\
  -type f -size +100M -exec ls -lh {} \\; 2>/dev/null \\
  | sort -k5 -rh \\
  | head -20 \\
  | awk '{print $5, $9}'

echo ""
echo "Review these before deleting anything!"`,
    },
    {
      id: "startup-mac",
      title: "Manage Login Items",
      icon: Clock,
      description: "Lists all apps that open at login so you can decide what to keep.",
      script: `#!/bin/bash
# Made Super AI — macOS Login Items

echo "=== LAUNCH AGENTS (Current User) ==="
ls ~/Library/LaunchAgents/ 2>/dev/null

echo ""
echo "=== LAUNCH DAEMONS (System) ==="
ls /Library/LaunchDaemons/ 2>/dev/null

echo ""
echo "=== LOGIN ITEMS (GUI) ==="
osascript -e 'tell application "System Events" to get the name of every login item'

echo ""
echo "To remove: System Settings > General > Login Items"`,
    },
    {
      id: "repair-mac",
      title: "Repair Disk Permissions",
      icon: Shield,
      description: "Resets system permissions and runs First Aid on your startup disk.",
      script: `#!/bin/bash
# Made Super AI — Repair Mac Disk & Permissions

echo "Repairing disk permissions..."
sudo diskutil repairPermissions /

echo ""
echo "Running First Aid on startup volume..."
sudo diskutil verifyVolume /
sudo diskutil repairVolume /

echo ""
echo "Resetting directory services..."
sudo /usr/libexec/repair_packages --repair --standard-pkgs /

echo "Done! Restart recommended."`,
    },
  ],
  linux: [
    {
      id: "disk-cleanup-linux",
      title: "Disk Cleanup",
      icon: HardDrive,
      description: "Removes old packages, journal logs, snap caches, and temp files (Ubuntu/Debian).",
      script: `#!/bin/bash
# Made Super AI — Linux Disk Cleanup (Ubuntu/Debian)

echo "Starting Linux disk cleanup..."

# Update package list
sudo apt update

# Remove unused packages
sudo apt autoremove -y
echo "Removed unused packages"

# Clean package cache
sudo apt autoclean
sudo apt clean
echo "Cleaned package cache"

# Clear journal logs older than 7 days
sudo journalctl --vacuum-time=7d
echo "Cleared old journal logs"

# Clear user cache
rm -rf ~/.cache/*
echo "Cleared user cache"

# Clear temp files
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*
echo "Cleared temp files"

# Remove old snap revisions
if command -v snap &>/dev/null; then
  snap list --all | awk '/disabled/{print $1, $3}' | while read snapname revision; do
    sudo snap remove "$snapname" --revision="$revision"
  done
  echo "Removed old snap revisions"
fi

df -h /
echo "Cleanup complete!"`,
    },
    {
      id: "find-large-linux",
      title: "Find Large Files",
      icon: Search,
      description: "Finds the 20 largest files on your Linux system.",
      script: `#!/bin/bash
# Made Super AI — Find Large Files on Linux

echo "Finding files larger than 100MB..."
echo ""

sudo find / -xdev -type f -size +100M \\
  -exec ls -lh {} \\; 2>/dev/null \\
  | sort -k5 -rh \\
  | head -20 \\
  | awk '{print $5, $9}'

echo ""
echo "=== DISK USAGE BY DIRECTORY (Top 10) ==="
sudo du -h --max-depth=2 / 2>/dev/null | sort -rh | head -10`,
    },
    {
      id: "system-info-linux",
      title: "System Health Check",
      icon: Shield,
      description: "Shows disk usage, memory, CPU load, and running services.",
      script: `#!/bin/bash
# Made Super AI — Linux System Health Check

echo "=== DISK USAGE ==="
df -h

echo ""
echo "=== MEMORY ==="
free -h

echo ""
echo "=== CPU LOAD ==="
uptime
top -bn1 | head -20

echo ""
echo "=== TOP MEMORY PROCESSES ==="
ps aux --sort=-%mem | head -11

echo ""
echo "=== FAILED SERVICES ==="
systemctl --failed

echo ""
echo "=== LAST SYSTEM ERRORS ==="
sudo journalctl -p err -n 20 --no-pager`,
    },
  ],
};

type OS = "windows" | "mac" | "linux";

export function ToolsPage() {
  const { toast } = useToast();
  const [os, setOs] = useState<OS>("windows");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [scanning, setScanning] = useState(false);
  const [dirName, setDirName] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("All");
  const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null);

  const copyScript = (script: string, title: string) => {
    navigator.clipboard.writeText(script);
    toast({ title: `Copied: ${title}`, description: "Paste it in your terminal / PowerShell and run." });
  };

  const scanDirectory = useCallback(async (dirHandle: FileSystemDirectoryHandle, path = "") => {
    const results: FileEntry[] = [];
    for await (const [name, handle] of (dirHandle as unknown as AsyncIterable<[string, FileSystemHandle]>)) {
      const entryPath = path ? `${path}/${name}` : name;
      if (handle.kind === "file") {
        try {
          const file = await (handle as FileSystemFileHandle).getFile();
          results.push({
            name,
            path: entryPath,
            size: file.size,
            kind: "file",
            type: getFileCategory(name),
            handle: handle as FileSystemFileHandle,
          });
        } catch {
          // skip unreadable files
        }
      } else {
        results.push({ name, path: entryPath, size: 0, kind: "directory", type: "Directory" });
        const sub = await scanDirectory(handle as FileSystemDirectoryHandle, entryPath);
        results.push(...sub);
      }
    }
    return results;
  }, []);

  const handleGrantAccess = async () => {
    try {
      const dirHandle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
      dirHandleRef.current = dirHandle;
      setDirName(dirHandle.name);
      setScanning(true);
      setSelectedFiles(new Set());

      const found = await scanDirectory(dirHandle);
      setFiles(found.sort((a, b) => b.size - a.size));
      toast({ title: "Folder scanned", description: `Found ${found.length} items in "${dirHandle.name}"` });
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast({ title: "Access denied", description: "Could not access the selected folder.", variant: "destructive" });
      }
    } finally {
      setScanning(false);
    }
  };

  const toggleSelect = (path: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const selectAll = () => {
    const filtered = filteredFiles.map(f => f.path);
    setSelectedFiles(prev => {
      const allSelected = filtered.every(p => prev.has(p));
      if (allSelected) {
        const next = new Set(prev);
        filtered.forEach(p => next.delete(p));
        return next;
      }
      return new Set([...prev, ...filtered]);
    });
  };

  const deleteSelected = async () => {
    if (!dirHandleRef.current || selectedFiles.size === 0) return;
    let deleted = 0;
    for (const file of files) {
      if (!selectedFiles.has(file.path) || file.kind === "directory") continue;
      try {
        const parts = file.path.split("/");
        const fileName = parts.pop()!;
        let dir: FileSystemDirectoryHandle = dirHandleRef.current;
        for (const part of parts) {
          dir = await dir.getDirectoryHandle(part);
        }
        await dir.removeEntry(fileName);
        deleted++;
      } catch {
        // skip
      }
    }
    setFiles(prev => prev.filter(f => !selectedFiles.has(f.path)));
    setSelectedFiles(new Set());
    toast({ title: `Deleted ${deleted} file${deleted !== 1 ? "s" : ""}`, description: "Files removed from your folder." });
  };

  const categories = ["All", ...Array.from(new Set(files.map(f => f.type)))];
  const filteredFiles = files.filter(f => filter === "All" || f.type === filter);

  const totalSize = files.filter(f => f.kind === "file").reduce((s, f) => s + f.size, 0);
  const junkFiles = files.filter(f => f.type === "Junk");
  const junkSize = junkFiles.reduce((s, f) => s + f.size, 0);
  const largeFiles = files.filter(f => f.size > 50 * 1024 * 1024);

  const osTabs = [
    { id: "windows" as OS, label: "Windows", icon: Monitor },
    { id: "mac" as OS, label: "macOS", icon: Apple },
    { id: "linux" as OS, label: "Linux", icon: Terminal },
  ];

  const currentScripts = SCRIPTS[os];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <div className="p-6 border-b bg-white/80 backdrop-blur-md shrink-0">
        <h1 className="text-3xl font-display font-extrabold gradient-text">System Tools</h1>
        <p className="text-muted-foreground mt-1 font-medium">File Manager with browser access + ready-to-run cleanup scripts for every OS.</p>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="files" className="h-full flex flex-col">
          <div className="px-6 pt-4 border-b bg-white shrink-0">
            <TabsList className="h-11">
              <TabsTrigger value="files" className="gap-2 font-semibold">
                <FolderTree className="w-4 h-4" /> File Manager
              </TabsTrigger>
              <TabsTrigger value="scripts" className="gap-2 font-semibold">
                <Terminal className="w-4 h-4" /> System Scripts
              </TabsTrigger>
            </TabsList>
          </div>

          {/* FILE MANAGER TAB */}
          <TabsContent value="files" className="flex-1 overflow-hidden m-0">
            <div className="h-full flex flex-col p-6 gap-4">
              {!dirName ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-blue-400/20 flex items-center justify-center border border-primary/20 shadow-lg">
                    <FolderOpen className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold mb-2">Grant Folder Access</h2>
                    <p className="text-muted-foreground max-w-md font-medium">
                      Click below and choose a folder. Your browser will ask for permission — once granted, Made Super AI can read, analyze, and help you clean up that folder.
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-3 max-w-sm mx-auto">
                      Access is limited to the folder you pick. Nothing outside that folder is touched.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleGrantAccess}
                    className="gap-3 h-14 px-8 text-base font-bold bg-gradient-to-r from-primary to-blue-600 shadow-lg hover:scale-105 transition-all"
                  >
                    <FolderOpen className="w-5 h-5" />
                    Choose a Folder
                  </Button>
                </div>
              ) : (
                <>
                  {/* Stats bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
                    <Card className="border-primary/20">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Total Files</div>
                        <div className="text-2xl font-bold">{files.filter(f => f.kind === "file").length}</div>
                        <div className="text-xs text-muted-foreground">{formatBytes(totalSize)}</div>
                      </CardContent>
                    </Card>
                    <Card className="border-red-200">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Junk Files</div>
                        <div className="text-2xl font-bold text-red-500">{junkFiles.length}</div>
                        <div className="text-xs text-muted-foreground">{formatBytes(junkSize)}</div>
                      </CardContent>
                    </Card>
                    <Card className="border-orange-200">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Large Files</div>
                        <div className="text-2xl font-bold text-orange-500">{largeFiles.length}</div>
                        <div className="text-xs text-muted-foreground">over 50 MB each</div>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Selected</div>
                        <div className="text-2xl font-bold text-green-600">{selectedFiles.size}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatBytes(files.filter(f => selectedFiles.has(f.path)).reduce((s, f) => s + f.size, 0))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Action bar */}
                  <div className="flex items-center gap-3 flex-wrap shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-semibold text-primary">
                      <FolderOpen className="w-4 h-4" />
                      {dirName}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleGrantAccess} className="gap-2">
                      <RefreshCw className="w-4 h-4" /> Change Folder
                    </Button>
                    {selectedFiles.size > 0 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={deleteSelected}
                        className="gap-2 ml-auto"
                      >
                        <Trash2 className="w-4 h-4" /> Delete {selectedFiles.size} selected
                      </Button>
                    )}
                  </div>

                  {/* Junk suggestion */}
                  {junkFiles.length > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200 shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                      <div className="flex-1 text-sm">
                        <span className="font-semibold text-red-700">Found {junkFiles.length} junk files</span>
                        <span className="text-red-600"> ({formatBytes(junkSize)}) — .tmp, .log, .bak, .cache files you probably don't need.</span>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setFilter("Junk");
                          setSelectedFiles(new Set(junkFiles.map(f => f.path)));
                        }}
                      >
                        Select All Junk
                      </Button>
                    </div>
                  )}

                  {/* Category filter */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAll}
                      className="text-xs font-semibold"
                    >
                      {filteredFiles.every(f => selectedFiles.has(f.path)) ? "Deselect All" : "Select All"}
                    </Button>
                    <div className="flex gap-2 flex-wrap">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setFilter(cat)}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                            filter === cat
                              ? "bg-primary text-white border-primary"
                              : "border-border text-muted-foreground hover:border-primary/40"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File list */}
                  <ScrollArea className="flex-1 rounded-xl border bg-white">
                    {scanning ? (
                      <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span className="font-medium">Scanning folder...</span>
                      </div>
                    ) : filteredFiles.length === 0 ? (
                      <div className="flex items-center justify-center h-40 text-muted-foreground font-medium">
                        No files in this category.
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredFiles.map((file) => (
                          <div
                            key={file.path}
                            onClick={() => file.kind === "file" && toggleSelect(file.path)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                              file.kind === "file" ? "cursor-pointer hover:bg-slate-50" : "bg-slate-50/50 cursor-default",
                              selectedFiles.has(file.path) && "bg-primary/8 border-l-4 border-l-primary"
                            )}
                          >
                            {file.kind === "file" && (
                              <div className={cn(
                                "w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center",
                                selectedFiles.has(file.path) ? "bg-primary border-primary" : "border-slate-300"
                              )}>
                                {selectedFiles.has(file.path) && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                            )}
                            {file.kind === "directory" && <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{file.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{file.path}</div>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] shrink-0",
                                file.type === "Junk" && "border-red-300 text-red-600 bg-red-50",
                                file.type === "Image" && "border-blue-300 text-blue-600",
                                file.type === "Video" && "border-purple-300 text-purple-600",
                                file.type === "Document" && "border-green-300 text-green-600",
                                file.type === "Code" && "border-cyan-300 text-cyan-600",
                              )}
                            >
                              {file.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono shrink-0 w-16 text-right">
                              {file.kind === "file" ? formatBytes(file.size) : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </>
              )}
            </div>
          </TabsContent>

          {/* SYSTEM SCRIPTS TAB */}
          <TabsContent value="scripts" className="flex-1 overflow-auto m-0 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* OS selector */}
              <div className="flex gap-3">
                {osTabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setOs(id)}
                    className={cn(
                      "flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm border-2 transition-all",
                      os === id
                        ? "bg-primary text-white border-primary shadow-lg"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Before running any script:</strong> Read what it does. Scripts marked "Administrator" or "sudo" need elevated privileges. When in doubt, run one line at a time.
                </div>
              </div>

              <div className="grid gap-4">
                {currentScripts.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.id} className="border shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{item.title}</CardTitle>
                              <CardDescription className="text-sm mt-0.5">{item.description}</CardDescription>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyScript(item.script, item.title)}
                            className="gap-2 shrink-0 font-semibold"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy Script
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs overflow-x-auto font-mono leading-relaxed max-h-48 overflow-y-auto">
                          {item.script}
                        </pre>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Need a custom script?
                  </CardTitle>
                  <CardDescription>
                    Go to Chat and ask Made Super AI — describe your problem and it will write a script specifically for your situation, explain every line, and walk you through running it safely.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
