// @flow strict-local
import type {NamedBundle, BundleGraph} from '@parcel/types';

import {Reporter} from '@parcel/plugin';

const DARK_GREY = '\u001b[38;5;000m';
const RED = '\u001b[38;5;001m';
const GREEN = '\u001b[38;5;002m';
const YELLOW = '\u001b[38;5;003m';
const BLUE = '\u001b[38;5;004m';
const PURPLE = '\u001b[38;5;005m';
const LIGHT_BLUE = '\u001b[38;5;006m';
const WHITE = '\u001b[38;5;007m';

const RESET = '\u001b[39m';

const blue = (s: string): string => `${BLUE}${s}${RESET}`;
const yellow = (s: string): string => `${YELLOW}${s}${RESET}`;
const red = (s: string): string => `${RED}${s}${RESET}`;

export default (new Reporter({
  async report({event, options}) {
    // return console.log(yellow(event.type));
    switch (event.type) {
      case 'watchStart':
        console.log(yellow('[wst]'), 'watch start');
        break;
      case 'buildStart':
        console.log(yellow('[bst]'), 'build start');
        break;
      // Most hopin' build event
      case 'buildProgress':
        switch (event.phase) {
          case 'resolving':
            console.log(
              yellow('[bpr]'),
              `${blue(event.phase)} ${yellow(
                // $FlowFixMe
                event.dependency.sourcePath,
              )} -> ${yellow(event.dependency.specifier)}`,
            );
            break;
          case 'transforming':
            console.log(
              yellow('[bpr]'),
              `${blue(event.phase)} ${yellow(event.filePath)}`,
            );
            break;
          case 'bundling':
            console.log(yellow('[bpr]'), `${blue(event.phase)}`);
            break;
          case 'bundled':
            console.log(yellow('[bpr]'), `${blue(event.phase)}`);
            const bundleGraph = event.bundleGraph;
            printBundleGraph(bundleGraph);
            break;
          case 'packaging':
            console.log(yellow('[bpr]'), `${blue(event.phase)}`);
            printBundle(event.bundle);
            break;
          case 'optimizing':
            console.log(yellow('[bpr]'), `${blue(event.phase)}`);
            printBundle(event.bundle);
            break;
          default:
            console.log(red('[bpr]'), `unhandled phase=${red(event.phase)}`);
        }
        break;
      case 'buildSuccess':
        console.log(yellow('[bss]'), `build success`);
        break;
      case 'log':
        if (event.diagnostics != null) {
          for (let diag of event.diagnostics) {
            console.log(`${yellow('[log]')} ${blue('diag')} ${diag.message}`);
          }
        } else {
          console.log(red(event.type), 'unknown log event', event);
        }
        break;
      default:
        console.log(red(event.type), 'unhandled event', event);
    }

    return Promise.resolve();
  },
}): Reporter);

function printBundleGraph(bundleGraph: BundleGraph<NamedBundle>): void {
  bundleGraph.traverseBundles((bundleNode, context, actions) => {
    // $FlowFixMe
    const isPlaceholder = bundleGraph.graph._graph.getNodeByContentKey(
      bundleNode.id,
    ).value.isPlaceholder;
    console.log(
      `  ${bundleNode.name} ${isPlaceholder ? yellow('[placeholder]') : ''}`,
    );
    bundleNode.traverseAssets((assetNode, context, actions) => {
      console.log('    ', assetNode.filePath);
    });
  });
}

function printBundle(bundle: NamedBundle): void {
  console.log('  ', bundle.name);
  bundle.traverseAssets((assetNode, context, actions) => {
    console.log('    ', assetNode.filePath);
  });
}
