/**
 * Sets the version in all packages, according to the repo package structure.
 *
 * ```bash
 * node version 1.1.1
 * ```
 */
import * as fs from 'node:fs/promises'

const foldersWithProjects = [
    'packages',
    'angular-packages/projects',
]

const extraPackages = [
    './package.json' // root package.json must be in sync to represent overall project version
]

const version = process.argv[2]

async function handlePackageJson(packageJsonPath, dirent) {
    let fileHandle;
    let config;
    try {
        fileHandle = await fs.open(packageJsonPath, 'r')
        const content = await fileHandle.readFile({encoding: 'utf8'})
        config = JSON.parse(content)
    } finally {
        await fileHandle?.close()
    }
    if (config) {
        config.version = version
        let fileHandleWrite
        try {
            fileHandleWrite = await fs.open(packageJsonPath, 'w')
            await fileHandleWrite.writeFile(JSON.stringify(config, null, 2), {encoding: 'utf8'})
            if (dirent) {
                console.log(dirent.name, version)
            } else {
                console.log(packageJsonPath, version)
            }
        } finally {
            fileHandleWrite?.close()
        }
    }
}

if (version && version.match(/\d+\.\d+\.\d+/)) {
    for (const folder of foldersWithProjects) {
        const dir = await fs.opendir(folder)
        for await (const dirent of dir) {
            if (dirent.isDirectory()) {
                const packageJsonPath = folder + '/' + dirent.name + '/package.json'
                await handlePackageJson(packageJsonPath, dirent)
            }
        }
    }
    for (const packageJsonPath of extraPackages) {
        await handlePackageJson(packageJsonPath)
    }

} else {
    console.error('provide version as argument in form of X.X.X')
}
