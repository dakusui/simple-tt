package com.github.dakusui.simple_tt.core;

import com.github.dakusui.processstreamer.core.process.ProcessStreamer;
import com.github.dakusui.processstreamer.core.process.Shell;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public class CommandLauncher {
  private final File file;
  private final Shell shell;
  private final String command;
  private final List<CommandLauncherOption> options;
  private final List<String> args;
  private final boolean background;
  
  CommandLauncher(File directory, Shell shell, String command, List<CommandLauncherOption> options, List<String> args, boolean background) {
    this.file = directory;
    this.shell = shell;
    this.command = command;
    this.options = options;
    this.args = args;
    this.background = background;
  }
  
  public static CommandLauncher.Builder begin() {
    return new Builder();
  }
  
  public Stream<String> perform() {
    return new ProcessStreamer.Builder(this.shell, composeCommandLine())
        .build()
        .stream();
  }
  
  private String composeCommandLine() {
    var b = new StringBuilder();
    b.append(this.command);
    for (var option : this.options) {
      b.append(" ");
      b.append(option);
    }
    for (var arg : this.args) {
      b.append(" ");
      b.append('"');
      b.append(arg);
      b.append('"');
    }
    if (this.background) {
      b.append(" ");
      b.append("&");
    }
    return b.toString();
  }
  
  public static class Builder {
    File directory;
    public Shell shell;
    public String command;
    private final List<CommandLauncherOption> options = new ArrayList<>();
    private final List<String> args = new ArrayList<>();
    private boolean background;
    
    public Builder() {
      this.shell(Shell.local()).background(false);
    }
    
    public Builder shell(Shell shell) {
      this.shell = shell;
      return this;
    }
    
    /**
     * By giving `null` you can run the command in the current directory.
     * @param directory a directory in which the command is run.
     * @return This object.
     */
    public Builder directory(File directory) {
      this.directory = directory;
      return this;
    }
    
    public Builder shell(String shellCommand) {
      return this.shell(new Shell.Builder.ForLocal().clearOptions()
                                                    .withProgram(shellCommand)
                                                    .build());
    }
    
    public Builder command(String command) {
      this.command = command;
      return this;
    }
    
    public Builder option(String option) {
      return this.option(option, null);
    }
    
    public Builder arg(String arg) {
      this.args.add(arg);
      return this;
    }
    
    public Builder option(String option, String value) {
      this.options.add(new CommandLauncherOption(option, value));
      return this;
    }
    
    public Builder background() {
      return background(true);
    }
    
    private Builder background(boolean background) {
      this.background = background;
      return this;
    }
    
    public CommandLauncher build() {
      return new CommandLauncher(directory, shell, command, this.options, this.args, this.background);
    }
    
    public Stream<String> perform() {
      return build().perform();
    }
    
  }
}
