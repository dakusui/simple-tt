# A simple test tracker project

This is a simple test tracker tool project to demonstrate capabilities of the **InsDog** (InspektorDog) testing framework.
The application is a test tracker designed for auotomated testing centric software projects.

# How to play?

Once you cloned, you can do:

```
./bootstrap.sh
```

A minute later, everything you need for development is installed under `.dependencies` directory.
Now, do:

```
source .env.rc
```

This sets environment variables, especially `PATH`, with which lets your terminal know where tools (local `brew`, `maven`, etc.) and simple-tt itself are.

## From Command-line

Then, 

```
conductor START
```

This will start the simple-tt tool.
You can access the app using your browser at `http://localhost:3000/dashboard`.

`conductor` is a useful tool to orchestrate the application, its backend, and dataset states.
Try `conductor --help`, `conductor list-tasks`, or `conductor list-stages` to know more.
Enjoy!

## From IDE

Open the project root directory with your IDEA.
To run autotest, you can try **SimplerSmoke** and **Smoke** run configuration.



