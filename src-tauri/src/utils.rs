#[cfg(windows)]
pub fn new_hidden_command(program: &str) -> std::process::Command {
    use std::os::windows::process::CommandExt;
    let mut cmd = std::process::Command::new(program);
    // 0x08000000 = CREATE_NO_WINDOW: Prevents black console/PowerShell windows from flashing
    cmd.creation_flags(0x08000000);
    cmd
}

#[cfg(not(windows))]
pub fn new_hidden_command(program: &str) -> std::process::Command {
    std::process::Command::new(program)
}
