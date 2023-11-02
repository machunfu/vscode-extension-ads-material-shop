// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path = require('path');
import * as vscode from 'vscode';
import * as fs from 'fs';
const axios = require('axios');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('ads.material.shop.commontable', (uri: vscode.Uri) => {
		const outputPath = getActiveExploreContextPath(uri);
		downloadGithub("account", outputPath);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('ads.material.shop.basictable', (uri: vscode.Uri) => {
		const outputPath = getActiveExploreContextPath(uri);
		// downloadGithubRecursive("table", outputPath);
		downloadGitlab();
	}));

}


function getActiveExploreContextPath(uri: vscode.Uri) {
	const activePath = fs.lstatSync(uri.fsPath);
	const isFile = activePath.isFile();
	const outputPath = isFile ? path.dirname(uri.fsPath) : uri.fsPath;
	return outputPath;
}

// GitHub 仓库信息
const repositoryOwner = 'machunfu'; // 仓库所有者的用户名
const repositoryName = 'a-mock-material-shop'; // 仓库名称
const sourceDirectory = 'src'; // 源目录路径

// gitlab 仓库信息
// const gitlab_host='git.minrow.com'
// const namespace='adsdesk'
// const project_name='ry-design-web'
// const ref='master'
// const path='src/assets/data/stylelib'
// const apiUrl1=`https://${gitlab_host}/api/v4/projects/${namespace}%2F${project_name}/repository/tree?ref=${ref}&path=${path}`

// 下载并创建文件夹和文件
async function downloadGithub(directoryPath: string, outputPath: string) {
	// github
	const apiUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/contents/${sourceDirectory}/${directoryPath}`;

	await axios.get(apiUrl, { timeout: 5000 })
		.then((response: { data: any; }) => {
			const contents = response.data;
			for (const content of contents) {
				const contentPath = path.join(directoryPath, content.name);
				if (content.type === 'dir') {
					const folderPath = path.join(outputPath, contentPath);
					fs.mkdirSync(folderPath, { recursive: true });
					const newStr = contentPath.replace(/\\/g, '/');
					downloadGithubRecursive(newStr, folderPath);
				} else if (content.type === 'file') {
					// 如果是文件，则下载到本地
					const fileUrl = content.download_url;
					const folderPath = path.join(outputPath, directoryPath);
					const filePath = path.join(folderPath, content.name);
					fs.mkdirSync(folderPath, { recursive: true });
					axios.get(fileUrl, { responseType: 'stream' })
						.then((response: { data: { pipe: (arg0: fs.WriteStream) => void; }; }) => {
							response.data.pipe(fs.createWriteStream(filePath));
							vscode.window.showInformationMessage(`已下载文件：${content.name}`);
						})
						.catch((error: any) => {
							vscode.window.showErrorMessage(`下载文件出错：${error.message}`);
						});
				}
			}
		})
		.catch((error: any) => {
			vscode.window.showErrorMessage(`获取目录内容出错：${error.message}`);
		});
}

// 递归下载并创建文件夹和文件
async function downloadGithubRecursive(directoryPath: string, outputPath: string) {
	// github
	const apiUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/contents/${sourceDirectory}/${directoryPath}`;

	await axios.get(apiUrl, { timeout: 5000 })
		.then((response: { data: any; }) => {
			const contents = response.data;
			for (const content of contents) {
				const contentPath = path.join(directoryPath, content.name);
				if (content.type === 'dir') {
					// 如果是文件夹，则递归下载并创建
					const folderPath = path.join(outputPath, content.name);
					fs.mkdirSync(folderPath, { recursive: true });
					const newStr = contentPath.replace(/\\/g, '/');
					downloadGithubRecursive(newStr, folderPath);
				} else if (content.type === 'file') {
					// 如果是文件，则下载到本地
					const fileUrl = content.download_url;
					const filePath = path.join(outputPath, content.name);
					fs.mkdirSync(outputPath, { recursive: true });
					axios.get(fileUrl, { responseType: 'stream' })
						.then((response: { data: { pipe: (arg0: fs.WriteStream) => void; }; }) => {
							response.data.pipe(fs.createWriteStream(filePath));
							vscode.window.showInformationMessage(`已下载文件：${content.name}`);
						})
						.catch((error: any) => {
							vscode.window.showErrorMessage(`下载文件出错：${error.message}`);
						});
				}
			}
		})
		.catch((error: any) => {
			vscode.window.showErrorMessage(`获取目录内容出错：${error.message}`);
		});
}

function downloadGitlab() {
	debugger;
	const headers = {
		'Authorization': 'Bearer RjKy55kTsu1Nxtci2duv'
	};
	// 获取项目ID  
	axios.get('https://git.minrow.com/adsdesk/ry-design-web/api/v4/projects', { headers })
		.then((response: { data: { id: any; }; }) => {
			const projectId = 959;// response.data.id; // 在响应数据中找到项目ID  

			// 请求仓库目录  
			axios.get(`https://git.minrow.com/adsdesk/ry-design-web/api/v4/projects/${projectId}/repository/files/package%2Ejson/raw?ref=master&private_token=['RjKy55kTsu1Nxtci2duv']`, { headers })
				.then((response: { data: any; }) => {
					const tree = response.data; // 在响应数据中获取目录树  
					console.log(tree); // 打印目录树数据  
				})
				.catch((error: any) => {
					console.error(error); // 处理请求错误  
				});
		})
		.catch((error: any) => {
			console.error(error); // 处理获取项目ID的请求错误  
		});
}


// This method is called when your extension is deactivated
export function deactivate() { }
