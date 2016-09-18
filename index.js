/*
 * fis
 * http://fis.baidu.com/
 */

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var jade = require( 'jade' );
var basedir = fis.project.getProjectPath();

module.exports = function( content, file, conf ) {
  var data = {};
  if ( conf.data || file.extras.jade ) {
    data = ( file.extras.jade && file.extras.jade.data ) || conf.data;
    if ( data instanceof Function ) {
      data = data( file );
    }
  }
  if ( conf.filters ) {
    Object.keys( conf.filters ).forEach( function( filter ) {
      jade.filters[ filter ] = conf.filters[ filter ].bind( file );
    } );
  }
  conf.basedir = conf.basedir || basedir;
  var template = jade.compile( content, conf );

  // fis.log.info(file);
  var resourceList = [];
  var jadeList = template.dependencies;
  jadeList.forEach( function( filePath ) {
    // get current file path
    var currentPath = path.dirname( filePath );
    // fis.log.info(currentPath);
    var file = fis.file( filePath );
    // fis.log.info('each loop');
    var content = file.getContent();
    // TODO: convert sass file path
    var reg = /(link|script|img)\(.*(src|href)=['"](.+?)['"].*\)/g;
    var tmp1;
    // search the whole content to get all resources
    do {
      tmp1 = reg.exec( content );
      if ( !tmp1 ) {
        break;
      }
      resourceList.push( {
          fullMatch: tmp1[ 0 ],
          type: tmp1[ 1 ],
          relativePath: tmp1[ 3 ],
          absolutePath: path.resolve( currentPath, tmp1[ 3 ] ).replace(/\\/g, '')
        } )
        // fis.log.info(resourceInFile);
    } while ( tmp1.index < content.length - 1 )
  } );
  // fis.log.info(resourceList);

  // file.useCache = false;
  // fis.compile.process(file);
  // fis.log.info(file);

  template.dependencies.forEach( function( dep ) {
    file.cache.addDeps( dep );
  } );

  var exportContent = template( data );
  // replace resource path base on this template location, after template complied
  var root = file.realpath.replace( file.subpath, '' );
  // fis.log.info(root);
  resourceList.forEach( function( tmp ) {
    var pathBaseOnRoot = '';
    if ( fs.statSync( tmp.absolutePath ).isFile() ) {
      // file.addLink(tmp.absolutePath);
      pathBaseOnRoot = tmp.absolutePath.replace( root, '' );
      // fis.log.info(tmp.relativePath);
      // fis.log.info(pathBaseOnRoot);
      exportContent = exportContent.replace( tmp.relativePath, pathBaseOnRoot );
    }
  } );
  // fis.log.info(exportContent);
  return exportContent;
};
