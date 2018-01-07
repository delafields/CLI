# ScaffGit

Scaffold a project, create github repo, & make first commit from the command line

## Features

Choose whether to add:

* README
* A License
  * MIT, Apache, or GNU
* A .gitignore (templates from [gitignore.io](https://www.gitignore.io/))
  * Current language options: C++, Go, Javascript, Python, Rust

Then enter Github credentials(encrypted & stored locally), name your repo/description, & make first commit!

![Screenshot-terminal](https://i.imgur.com/h4SRkvr.png)
...and you get:
![Screenshot-directory](https://i.imgur.com/oFp4hhW.png)

## Development setup

git clone

install dependencies

```
npm install
or
yarn
```

Change name from <Jeremy Fields> in the licenses

(Optional) change executable command <name> in package.json "bin": {"<name>": "index.js"}

install for global use

```
npm install -g
```

Now available in the terminal through calling scaffgit or <name>(see above)

## History

* 1.0.0
  * Initial Commit
