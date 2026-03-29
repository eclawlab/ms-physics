// Copyright 2018-2024, University of Colorado Boulder

/**
 * Combine JSON and MD into an HTML report.
 * @author Sam Reid (PhET Interactive Simulations)
 */


// const getMarkdownFileAsHTML = require( './getMarkdownFileAsHTML.js' );
const fs = require( 'fs' );
const handlebars = require( 'handlebars' );
const marked = require( 'marked' );
const grayMatter = require( 'gray-matter' );
const path = require( 'path' );

// const apiUrl = '';
const simsDirectory = path.normalize( `${__dirname}/../..` );

// returns an object with the 'data' and 'content' keys
function processFile( filePath ) {

  // get the front matter object
  const mdObject = grayMatter.read( filePath );
  const pathArray = filePath.split( path.sep );
  const docIdx = pathArray.indexOf( 'doc' );
  const repo = pathArray[ docIdx - 1 ];
  mdObject.content = marked( mdObject.content ).split( '<img src="images/' ).join( `<img src="images/${repo}/` );
  mdObject.repo = repo;
  return mdObject;
}

// responsible for returning a list of all filepaths for files within a `doc` directory for a given sim repo
function getFullDocPaths( repo ) {
  const docDir = path.join( simsDirectory, repo, 'doc' );
  return getFilePathsFromDir( docDir, [] );
}

function getFilePathsFromDir( dir, filelist = [] ) {
  if ( !( dir.includes( 'templates' ) || dir.includes( 'images' ) ) && fs.existsSync( dir ) ) {
    fs.readdirSync( dir ).forEach( file => {
      filelist = fs.statSync( path.join( dir, file ) ).isDirectory()
                 ? getFilePathsFromDir( path.join( dir, file ), filelist )
                 : filelist.concat( path.join( dir, file ) );
    } );
  }
  return filelist;
}

// flattens a multidimensional array
function flatten( arr ) {
  return [].concat( ...arr );
}

// compile and get the given template file
function getHandlebarsTemplate( filename ) {
  const fullPath = path.normalize( `${__dirname}/../templates/${filename}` );
  return handlebars.compile( fs.readFileSync( fullPath, 'utf8' ) );
}

/**
 * The data object has levels like sims=>components=>dataURLs
 * So each simKey is another object
 * @param {Object} data - see `getFromSimInMain` for more details.
 * @returns {string} - the HTML
 */
const createHTMLString = function( data ) {
  const components = data.components;
  const sims = data.sims;
  const hotkeys = data.hotkeys;

  // organize the data for the "sims by component" view
  const simsByComponent = Object.keys( components ).map( component => {
    return { name: component, sims: Object.keys( components[ component ] ) };
  } );
  let contentHTML = '';

  // get list of files in all docs/ directories, excluding binder (can be async)
  const repos = new Set( Object.keys( components ).map( item => item.split( '/' )[ 0 ] ) );
  const documentPaths = flatten( [ ...repos ].map( getFullDocPaths ) );

  const mdData = {};
  for ( const docPath of documentPaths ) {
    const name = path.basename( docPath, '.md' );
    mdData[ name ] = processFile( docPath );
  }

  // reduce the hotkeys data into a single collection with duplicates removed, instead of organized by sim
  const uniqueHotkeys = new Map();

  // this syntax skips the first element of the array, which is the sim name
  for ( const [ , hotkeyList ] of Object.entries( hotkeys ) ) {
    for ( const hotkey of hotkeyList ) {

      // Create a unique key for each hotkey
      const uniqueKey = `${hotkey.binderName}_${hotkey.keyStrings.join( '_' )}_${hotkey.repoName}`;

      if ( !uniqueHotkeys.has( uniqueKey ) ) {
        uniqueHotkeys.set( uniqueKey, {
          ...hotkey
        } );
      }
    }
  }
  const hotkeyArray = Array.from( uniqueHotkeys.values() );

// handlebars helper functions
  handlebars.registerHelper( 'componentLink', ( repo, component ) => {
    return new handlebars.SafeString(
      `<a href="https://github.com/phetsims/${repo}/blob/main/js/${component}.ts">Source Code and Options</a>`
    );
  } );

  handlebars.registerHelper( 'simPageLink', simName => {
    return new handlebars.SafeString(
      `<a href="https://phet.colorado.edu/en/simulation/${simName}" target="_blank">PhET Simulation Page</a>`
    );
  } );

  handlebars.registerHelper( 'navList', ( components, parentRepo ) => {
    const itemsHTML = components.map( c => {
      const repo = mdData[ c ]?.repo || parentRepo;
      return `<li><a href="#${repo}-${c}">${c}</a></li>`;
    } ).join( '\n' );
    return `<ul class="nav bd-sidenav">${itemsHTML}</ul>`;
  } );

  const parentComponents = Object.values( mdData ).filter( component => component.data.parent );

  const baseTemplate = getHandlebarsTemplate( 'base.html' );
  const parentComponentTemplate = getHandlebarsTemplate( 'parentComponent.html' );
  const singleComponentTemplate = getHandlebarsTemplate( 'singleComponent.html' );
  const componentsBySimulationTemplate = getHandlebarsTemplate( 'componentsBySimulation.html' );
  const simsByComponentTemplate = getHandlebarsTemplate( 'simsByComponent.html' );
  const hotkeysTemplate = getHandlebarsTemplate( 'hotkeys.html' );

  // loop over each parent component
  for ( const parent of parentComponents ) {
    let componentsHTML = '';

    for ( const component of parent.data.components ) {
      const repo = mdData[ component ]?.repo || parent.repo;
      const repoComponent = `${repo}/${component}`;
      const simObject = components[ repoComponent ];
      const simCount = simObject ? Object.keys( simObject ).length : 0;
      const sims = simObject ?
                   Object.keys( simObject ).map( simName => {
                     return {
                       name: simName,
                       images: simObject[ simName ]
                     };
                   } ) : [];

      let markdown = mdData[ component ] ? mdData[ component ].content : `<p>No markdown content for ${component} yet.</p>`;
      markdown = new handlebars.SafeString( markdown );
      const componentContext = {
        component: component,
        sims: sims,
        simCount: simCount,
        markdown: markdown,
        repo: repo
      };

      componentsHTML += singleComponentTemplate( componentContext );
    }

    contentHTML += parentComponentTemplate( {
      content: new handlebars.SafeString( parent.content ),
      title: parent.data.title,
      id: parent.data.category,
      componentsHTML: new handlebars.SafeString( componentsHTML )
    } );
  }

  contentHTML += componentsBySimulationTemplate( { sims: sims } );

  contentHTML += simsByComponentTemplate( { components: simsByComponent } );

  // Sort hotkeys by repoName
  hotkeyArray.sort( ( a, b ) => {
    return a.repoName.localeCompare( b.repoName );
  } );
  contentHTML += hotkeysTemplate( { hotkeys: hotkeyArray } );

  return baseTemplate( {
    content: contentHTML, parents: parentComponents.map( p => {
      const retObj = p.data;
      retObj.repo = p.repo;
      return retObj;
    } )
  } );
};

/**
 * @param data sim => componentName => [dataURLs]
 * @returns {string}
 */

module.exports = createHTMLString;

// Shortcut to use stored JSON for quick iteration. See getFromSimInMain for writing of this data file.
const myArgs = process.argv.slice( 2 );
if ( myArgs[ 0 ] && myArgs[ 0 ] === 'json' ) {
  const inputFile = myArgs[ 1 ];
  const report = createHTMLString( JSON.parse( fs.readFileSync( inputFile ) ) );
  console.log( report );
}