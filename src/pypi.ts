import * as https from 'https';

function getJSON(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                try {
                    let json = JSON.parse(body);
                    resolve(json);
                } catch (error) {
                    reject(error);
                };
            });

        }).on("error", (error) => {
            reject(error.message);
        });
    });
}

export async function getLatestBoto3Version() {
    const data = await getJSON('https://pypi.org/pypi/boto3/json');
    return data.info.version;
}