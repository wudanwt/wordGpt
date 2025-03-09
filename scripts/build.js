import { exec } from 'child_process'
import fs from 'fs-extra'
import archiver from 'archiver'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(rootDir, 'dist')
const pluginDir = path.resolve(rootDir, 'plugin-dist')
const pluginName = 'word-gpt'

// 清理目录
async function cleanDirs() {
  console.log('清理目录...')
  await fs.remove(distDir)
  await fs.remove(pluginDir)
  await fs.ensureDir(pluginDir)
}

// 构建项目
async function buildProject() {
  console.log('构建项目...')
  return new Promise((resolve, reject) => {
    exec('npm run build', { cwd: rootDir }, (err, stdout, stderr) => {
      if (err) {
        console.error('构建失败:', stderr)
        reject(err)
        return
      }
      console.log(stdout)
      resolve()
    })
  })
}

// 复制必要文件
async function copyFiles() {
  console.log('复制文件...')
  
  // 复制构建产物
  await fs.copy(distDir, path.resolve(pluginDir))
  
  // 复制插件配置文件
  await fs.copy(
    path.resolve(rootDir, 'public/manifest.xml'),
    path.resolve(pluginDir, 'manifest.xml')
  )
  await fs.copy(
    path.resolve(rootDir, 'public/ribbon.xml'),
    path.resolve(pluginDir, 'ribbon.xml')
  )
  
  // 复制图标等资源
  await fs.copy(
    path.resolve(rootDir, 'public/images'),
    path.resolve(pluginDir, 'images')
  )
}

// 创建插件包
async function createPlugin() {
  console.log('创建插件包...')
  
  const output = fs.createWriteStream(path.resolve(rootDir, `${pluginName}.wpsplugin`))
  const archive = archiver('zip', { zlib: { level: 9 } })

  output.on('close', () => {
    console.log(`插件包已创建，大小: ${archive.pointer()} 字节`)
  })

  archive.on('error', (err) => {
    throw err
  })

  archive.pipe(output)
  archive.directory(pluginDir, false)

  await archive.finalize()
}

// 执行构建流程
async function build() {
  try {
    console.log('开始构建插件...')
    console.log('根目录:', rootDir)
    
    await cleanDirs()
    await buildProject()
    await copyFiles()
    await createPlugin()
    
    console.log('插件构建完成!')
    console.log(`插件包位置: ${path.resolve(rootDir, pluginName + '.wpsplugin')}`)
  } catch (err) {
    console.error('构建失败:', err)
    process.exit(1)
  }
}

build()
