# binder

See [https://phetsims.github.io/binder/](https://phetsims.github.io/binder/) for public up to date documentation and
style guide on PhET sim components.

Generates and publishes documentation for PhET simulation components. Included components are registered to
an `instanceRegistry` that's created as a result of a `binder` query parameter. It uses `puppeteer` to manage a Chromium
instance to grab the images of the registered components from the specified sims. We then stitch those images with
content from `doc` directories in sun/, scenery-phet/, and scenery/ (the latter two are forthcoming) and produce HTML in
the `doc` directory that houses the `gh-pages` branch. The page is hosted from [Github Pages](https://pages.github.com/)
from that branch.

## generation

To generate the component images and pull the appropriate :

    `npm run build`

To generate docs with only specific simulation examples, add them as an argument, comma separated:

    `npm run build -- ohms-law,wave-on-a-string`

The generated docs load sim to gather runtime information. To bypass this step and use stored data from sim loads:

    `npm run build-html`

NOTE: This will only log out the html string, not write it to the output file. The above snippet will copy the output
into a file of your choosing.

We render markdown and insert it into `index.html` with the `handlebars` library. These templates can be found in
the `templates/` directory.

For more information see https://github.com/phetsims/binder/ or contact @zepumph.

## output

This project is automatically run every night to regenerate the latest usages of PhET components, so just wait until 
tomorrow to see any changes (or manually update using the above steps).

`/docs` from main is hosted at  https://phetsims.github.io/binder/. So checking in the build file will update the
endpoint for all to see changes immediately. `docs/` is against phet convention of having a `doc/` folder, but github
requires the folder named as such to support hosting files from main. 

## Adding components

To add a new component here is a list of steps to take:
1. Create a markdown file in the desired common code repo `doc/` directory, see [sun/doc/templates/MarkdownTemplate.md](https://github.com/phetsims/sun/blob/main/doc/templates/MarkDownTemplate.md) for example.
2. Make sure to go to the parent category markdown file (likely just `sun/doc/OtherUI.md`) and add your component to that list.
3. To retrieve sim usages of this component. Go to the constructor of your class and add a registration line that looks like: https://github.com/phetsims/sun/blob/11823335e60202b42e07e912b73635da5b0da677/js/Slider.ts#L517-L518 
4. Binder is auto generated each night, so nothing more is needed to move your changes to production.

## Hotkeys

Binder also documents Hotkeys used in PhET simulations. Hotkeys are registered with scenery/HotkeyData, which also uses
the InstanceRegistry. The puppeteer script (getFromSimInMain.js) grabs the HotkeyData as its loads each sim.

- See getFromSimInMain.js for the work that gets hotkey data by loading simulations.
- See templates/hotkeys.html for the template used to render the hotkeys and the the filtering functionality.
- See base.html for the link to the hotkeys page. The classes on the link are required for the page to work.
- See createHTMLString.js for the work that uses the hotkeys.html template and fills it in from hotkeys data.