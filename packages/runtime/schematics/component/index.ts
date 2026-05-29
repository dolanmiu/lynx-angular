import type { Rule, Tree } from '@angular-devkit/schematics';
import { SchematicsException } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';

import type { Schema } from './schema';

export default (options: Schema): Rule =>
  async (tree: Tree) => {
    const workspace = await getWorkspace(tree);
    const projectName =
      options.project ??
      (workspace.extensions['defaultProject'] as string | undefined) ??
      [...workspace.projects.keys()][0];

    if (!projectName) {
      throw new SchematicsException(
        'No project found. Run this schematic inside an Angular workspace.',
      );
    }

    const project = workspace.projects.get(projectName);
    if (!project) {
      throw new SchematicsException(
        `Project "${projectName}" not found in angular.json.`,
      );
    }

    const sourceRoot = (project.sourceRoot ?? `${project.root}/src`) as string;
    const prefix =
      options.prefix ?? (project.extensions['prefix'] as string) ?? 'app';

    const nameParts = options.name.split('/');
    const componentName = nameParts[nameParts.length - 1];
    const additionalPath = nameParts.slice(0, -1).join('/');

    const dasherized = dasherize(componentName);
    const classified = classify(componentName);
    const selector = `${prefix}-${dasherized}`;

    const basePath = options.path ?? 'app';
    const dirPath = options.flat
      ? `${sourceRoot}/${basePath}${additionalPath ? '/' + additionalPath : ''}`
      : `${sourceRoot}/${basePath}${additionalPath ? '/' + additionalPath : ''}/${dasherized}`;

    const componentPath = `${dirPath}/${dasherized}.component.ts`;

    if (tree.exists(componentPath)) {
      throw new SchematicsException(
        `Component file already exists: ${componentPath}`,
      );
    }

    const componentContent = buildComponentFile(
      selector,
      classified,
      dasherized,
      options,
    );
    tree.create(componentPath, componentContent);

    if (!options.inlineTemplate) {
      const templatePath = `${dirPath}/${dasherized}.component.html`;
      tree.create(templatePath, buildTemplateFile(dasherized));
    }

    if (!options.inlineStyle) {
      const stylePath = `${dirPath}/${dasherized}.component.css`;
      tree.create(stylePath, buildStyleFile());
    }

    if (!options.skipTests) {
      const specPath = `${dirPath}/${dasherized}.component.spec.ts`;
      tree.create(specPath, buildSpecFile(classified, dasherized));
    }
  };

function buildComponentFile(
  selector: string,
  className: string,
  dasherized: string,
  options: Schema,
): string {
  const lines: string[] = [];

  lines.push(
    `import { Component, ChangeDetectionStrategy } from '@angular/core';`,
  );
  lines.push(`import { LYNX_ELEMENTS } from '@blotch/angular-lynx';`);
  lines.push('');
  lines.push(`@Component({`);
  lines.push(`  selector: '${selector}',`);
  lines.push(`  imports: [LYNX_ELEMENTS],`);
  lines.push(`  changeDetection: ChangeDetectionStrategy.OnPush,`);

  if (options.inlineTemplate !== false) {
    lines.push(`  template: \``);
    lines.push(`    <view>`);
    lines.push(`      <text>${dasherized} works!</text>`);
    lines.push(`    </view>`);
    lines.push(`  \`,`);
  } else {
    lines.push(`  templateUrl: './${dasherized}.component.html',`);
  }

  if (options.inlineStyle !== false) {
    lines.push(`  styles: [\`\`],`);
  } else {
    lines.push(`  styleUrl: './${dasherized}.component.css',`);
  }

  lines.push(`})`);
  lines.push(`export class ${className}Component {}`);
  lines.push('');

  return lines.join('\n');
}

function buildTemplateFile(dasherized: string): string {
  return `<view>
  <text>${dasherized} works!</text>
</view>
`;
}

function buildStyleFile(): string {
  return '';
}

function buildSpecFile(className: string, dasherized: string): string {
  return `import { describe, expect, it } from 'vitest';
import { render } from '@blotch/angular-lynx-testing-library';

import { ${className}Component } from './${dasherized}.component';

describe('${className}Component', () => {
  it('should render', async () => {
    const { getByText } = await render(${className}Component);
    expect(getByText('${dasherized} works!')).toBeTruthy();
  });
});
`;
}

/** Converts "myComponent" or "MyComponent" to "my-component" */
function dasherize(str: string): string {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

/** Converts "my-component" to "MyComponent" */
function classify(str: string): string {
  return str
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
