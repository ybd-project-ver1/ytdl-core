const fs = require('fs'),
    BASE_DIR = process.cwd() + '/examples/';

fs.readdir(BASE_DIR, (_, folders1) => {
    for (const FOLDER_1 of folders1) {
        if (FOLDER_1.includes('node_modules')) {
            console.log('Delete:', BASE_DIR + FOLDER_1);
            fs.rmSync(BASE_DIR + FOLDER_1, {
                recursive: true,
            });
            continue;
        } else if (folders1.length !== 0) {
            fs.readdir(BASE_DIR + FOLDER_1, (_, folders2) => {
                for (const FOLDER_2 of folders2) {
                    if (FOLDER_2.includes('node_modules')) {
                        console.log('Delete:', BASE_DIR + FOLDER_1 + '/' + FOLDER_2);
                        fs.rmSync(BASE_DIR + FOLDER_1 + '/' + FOLDER_2, {
                            recursive: true,
                        });
                        continue;
                    } else if (folders2.length !== 0) {
                        fs.readdir(BASE_DIR + FOLDER_1 + '/' + FOLDER_2, (_, folders3) => {
                            if (!folders3) {
                                return;
                            }

                            for (const FOLDER_3 of folders3) {
                                if (FOLDER_3.includes('node_modules')) {
                                    console.log('Delete:', BASE_DIR + FOLDER_1 + '/' + FOLDER_2 + '/' + FOLDER_3);
                                    fs.rmSync(BASE_DIR + FOLDER_1 + '/' + FOLDER_2 + '/' + FOLDER_3, {
                                        recursive: true,
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
    }
});
