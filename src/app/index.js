'use strict';

import path from 'path';
import { Base } from 'yeoman-generator';
import mkdirp from 'mkdirp';
import pathExists from 'path-exists';
import simpleGit from 'simple-git';
import slug from 'slug';

class MyGenerator extends Base {
  constructor(...args) {
    super(...args);
    slug.defaults.mode = 'rfc3986';
    this.opts = {
      year: new Date().getFullYear()
    };
  }

  prompting() {
    const done = this.async();
    const prompts = [{
      type: 'input',
      name: 'projectName',
      message: 'Enter the name of your project:',
      default: 'name-of-your-project'
    }, {
      type: 'input',
      name: 'description',
      message: 'Enter a description of your project:'
    }, {
      type: 'input',
      name: 'githubName',
      message: 'Enter your github username:',
      store: true
    }, {
      type: 'input',
      name: 'buildDir',
      message: 'Enter the name of your build directory:',
      default: 'build'
    }];
    this.prompt(prompts, res => {
      this.opts.projectName = slug(res.projectName);
      const dir = path.join('.', this.opts.projectName);
      if (!pathExists.sync(dir)) this.destinationRoot(dir);
      else this.env.error(`the directory '${this.opts.projectName}' already exists!`);
      this.git = simpleGit(this.destinationRoot());
      this.opts.description = res.description;
      this.opts.githubName = res.githubName;
      this.opts.buildDir = slug(res.buildDir);
      done();
    });
  }

  get writing() {
    return {
      // create root directory files
      rootFiles() {
        this.fs.copy(
          this.templatePath('babelrc'),
          this.destinationPath('.babelrc')
        );
        this.fs.copy(
          this.templatePath('eslintrc.json'),
          this.destinationPath('.eslintrc.json')
        );
        this.fs.copyTpl(
          this.templatePath('_bower.json'),
          this.destinationPath('bower.json'),
          this.opts
        );
        this.fs.copyTpl(
          this.templatePath('_gulpfile.babel.js'),
          this.destinationPath('gulpfile.babel.js'),
          this.opts
        );
        this.fs.copyTpl(
          this.templatePath('_LICENSE'),
          this.destinationPath('LICENSE'),
          this.opts
        );
        this.fs.copyTpl(
          this.templatePath('_package.json'),
          this.destinationPath('package.json'),
          this.opts
        );
      },
      // express app config and files
      app() {
        this.fs.copy(
          this.templatePath('src/app.js'),
          this.destinationPath('src/app.js')
        );
        this.fs.copyTpl(
          this.templatePath('src/app/controllers/_index.js'),
          this.destinationPath('src/app/controllers/index.js'),
          this.opts
        );
        this.fs.copy(
          this.templatePath('src/app/controllers/extras.js'),
          this.destinationPath('src/app/controllers/extras.js')
        );
        this.directory(
          this.templatePath('src/app/models'),
          this.destinationPath('src/app/models')
        );
        this.directory(
          this.templatePath('src/app/views'),
          this.destinationPath('src/app/views')
        );
      },
      // remaining source files
      src() {
        mkdirp(path.join(this.destinationRoot(), 'src/files'));
        this.directory(
          this.templatePath('src/fonts'),
          this.destinationPath('src/fonts')
        );
        this.directory(
          this.templatePath('src/images'),
          this.destinationPath('src/images')
        );
        this.directory(
          this.templatePath('src/scripts'),
          this.destinationPath('src/scripts')
        );
        this.directory(
          this.templatePath('src/styles'),
          this.destinationPath('src/styles')
        );
      },
      // create local git and commit all files
      git() {
        this.fs.copyTpl(
          this.templatePath('_gitignore'),
          this.destinationPath('.gitignore'),
          this.opts
        );
        this.fs.copyTpl(
          this.templatePath('_README.md'),
          this.destinationPath('README.md'),
          this.opts
        );
        this.git
          .init()
          .add('.')
          .commit(`${this.opts.projectName} initial commit`);
      }
    };
  }

  install() {
    this.installDependencies();
  }

  end() {
    this.log(`'${this.opts.projectName}' is all set up and ready to go!`);
  }
}

module.exports = MyGenerator;
