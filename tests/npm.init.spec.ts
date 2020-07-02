import { runTsBoot } from "./test-helpers/shared";
import "expect-even-more-jest";
import "./test-helpers/matchers";
import { NpmPackage } from "../src/newts";
import * as faker from "faker";
import { Sandbox } from "filesystem-sandbox";
import * as path from "path";

describe(`initialize npm`, () => {
    it(`should npm init when no package.json`, async () => {
        // Arrange
        const
            name = faker.random.alphaNumeric(5),
            sandbox = await Sandbox.create(),
            where = sandbox.path,
            packageJsonRelative = path.join(name, "package.json"),
            packageJsonFullPath = path.join(where, packageJsonRelative);
        expect(packageJsonFullPath)
            .not.toBeFile();
        // Act
        await runTsBoot({
            name,
            where
        });
        // Assert
        expect(packageJsonFullPath)
            .toBeFile();
        const pkg = JSON.parse(
            await sandbox.readTextFile(packageJsonRelative)) as NpmPackage;
        expect(pkg.name)
            .toEqual(name);
        expect(pkg.version)
            .toEqual("0.0.1");
        expect(pkg.main)
            .toEqual("dist/index.js");
        expect(pkg.files)
            .toEqual(["dist/**/*"]);
    });

    it(`should not destroy an existing package.json`, async () => {
        // Arrange
        const
            name = faker.random.alphaNumeric(5),
            sandbox = await Sandbox.create(),
            where = sandbox.path,
            packageJson = "package.json",
            pkg = {
                name: faker.random.alphaNumeric(10),
                version: "1.2.3",
                description: faker.random.words(),
                main: "foo.js",
                scripts: {
                    test: "moo cakes",
                    thing: "wat"
                },
                repository: {
                    type: "git",
                    url: "foo.bar.com/whatever"
                },
                keywords: faker.random.words().split(" "),
                author: `${ faker.name.firstName() } ${ faker.name.lastName() }`,
                license: faker.random.alphaNumeric(),
                devDependencies: {
                    foo: "^1.2.3"
                },
                dependencies: {
                    bar: "3.4.5"
                }
            };
        await sandbox.writeFile(
            packageJson,
            JSON.stringify(pkg)
        );
        // Act
        await runTsBoot({
            name,
            where
        });
        // Assert
        const contents = JSON.parse(await sandbox.readTextFile(packageJson));
        expect(contents)
            .toEqual(pkg);
    });
});
