import { YT_ItemSectionRenderer, YT_VideoPrimaryInfoRenderer, YT_VideoSecondaryInfoRenderer } from './Renderers';

export type YT_NextApiResponse = {
    responseContext: {
        visitorData: string;
    };
    contents: {
        twoColumnWatchNextResults: {
            results: {
                results: {
                    contents: Array<YT_VideoPrimaryInfoRenderer | YT_VideoSecondaryInfoRenderer>;
                };
            };
            secondaryResults: {
                secondaryResults: {
                    results: Array<YT_ItemSectionRenderer>;
                };
            };
        };
    };
    playerOverlays: {
        playerOverlayRenderer: {
            decoratedPlayerBarRenderer: {
                decoratedPlayerBarRenderer: {
                    playerBar: {
                        multiMarkersPlayerBarRenderer: {
                            markersMap?: [
                                {
                                    key: 'DESCRIPTION_CHAPTERS';
                                    value: {
                                        chapters: [
                                            {
                                                chapterRenderer: {
                                                    title: {
                                                        simpleText: 'Introduction example';
                                                    };
                                                    timeRangeStartMillis: 0;
                                                    onActiveCommand: {
                                                        clickTrackingParams: 'CKYBEMaHBiITCI3OmpqwsogDFa9Y9QUdPS8SAw==';
                                                        setActivePanelItemAction: {
                                                            panelTargetId: 'engagement-panel-macro-markers-description-chapters';
                                                            itemIndex: 0;
                                                        };
                                                    };
                                                    thumbnail: {
                                                        thumbnails: [
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_18866.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLCvtPiRFdMFGAAKEKL_X6dcOFLkcA';
                                                                width: 168;
                                                                height: 94;
                                                            },
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_18866.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLB2E7aeQb46vV3LkNSeXF2lEbo1XA';
                                                                width: 336;
                                                                height: 188;
                                                            },
                                                        ];
                                                    };
                                                };
                                            },
                                            {
                                                chapterRenderer: {
                                                    title: {
                                                        simpleText: 'Series preview';
                                                    };
                                                    timeRangeStartMillis: 67000;
                                                    onActiveCommand: {
                                                        clickTrackingParams: 'CKYBEMaHBiITCI3OmpqwsogDFa9Y9QUdPS8SAw==';
                                                        setActivePanelItemAction: {
                                                            panelTargetId: 'engagement-panel-macro-markers-description-chapters';
                                                            itemIndex: 1;
                                                        };
                                                    };
                                                    thumbnail: {
                                                        thumbnails: [
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_88933.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLCwOs3gSlwiuI_73UpUqa2DMGj4mA';
                                                                width: 168;
                                                                height: 94;
                                                            },
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_88933.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAEM8whuV3T2pom77a2wQHxiYArNw';
                                                                width: 336;
                                                                height: 188;
                                                            },
                                                        ];
                                                    };
                                                };
                                            },
                                            {
                                                chapterRenderer: {
                                                    title: {
                                                        simpleText: 'What are neurons?';
                                                    };
                                                    timeRangeStartMillis: 162000;
                                                    onActiveCommand: {
                                                        clickTrackingParams: 'CKYBEMaHBiITCI3OmpqwsogDFa9Y9QUdPS8SAw==';
                                                        setActivePanelItemAction: {
                                                            panelTargetId: 'engagement-panel-macro-markers-description-chapters';
                                                            itemIndex: 2;
                                                        };
                                                    };
                                                    thumbnail: {
                                                        thumbnails: [
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_162300.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLCcnx0Ooo7561BW5M9t2jRNob1i8g';
                                                                width: 168;
                                                                height: 94;
                                                            },
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_162300.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCmrD2t0KAbpZ8lXS40nZWXVuE0_g';
                                                                width: 336;
                                                                height: 188;
                                                            },
                                                        ];
                                                    };
                                                };
                                            },
                                            {
                                                chapterRenderer: {
                                                    title: {
                                                        simpleText: 'Introducing layers';
                                                    };
                                                    timeRangeStartMillis: 215000;
                                                    onActiveCommand: {
                                                        clickTrackingParams: 'CKYBEMaHBiITCI3OmpqwsogDFa9Y9QUdPS8SAw==';
                                                        setActivePanelItemAction: {
                                                            panelTargetId: 'engagement-panel-macro-markers-description-chapters';
                                                            itemIndex: 3;
                                                        };
                                                    };
                                                    thumbnail: {
                                                        thumbnails: [
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_241766.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLB5btJQViP_cqp_oASPo9D2OSNR6w';
                                                                width: 168;
                                                                height: 94;
                                                            },
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_241766.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBEcw8dUzFtZrjFO81cnE-gEnk1bQ';
                                                                width: 336;
                                                                height: 188;
                                                            },
                                                        ];
                                                    };
                                                };
                                            },
                                            {
                                                chapterRenderer: {
                                                    title: {
                                                        simpleText: 'Why layers?';
                                                    };
                                                    timeRangeStartMillis: 331000;
                                                    onActiveCommand: {
                                                        clickTrackingParams: 'CKYBEMaHBiITCI3OmpqwsogDFa9Y9QUdPS8SAw==';
                                                        setActivePanelItemAction: {
                                                            panelTargetId: 'engagement-panel-macro-markers-description-chapters';
                                                            itemIndex: 4;
                                                        };
                                                    };
                                                    thumbnail: {
                                                        thumbnails: [
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_339733.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLCryyVaBE66Ez2OVyR5NzgeJiSOkg';
                                                                width: 168;
                                                                height: 94;
                                                            },
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_339733.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLA1_Lj3W6Dr3lvPCNw1qQP7Vu4qpw';
                                                                width: 336;
                                                                height: 188;
                                                            },
                                                        ];
                                                    };
                                                };
                                            },
                                            {
                                                chapterRenderer: {
                                                    title: {
                                                        simpleText: 'Edge detection example';
                                                    };
                                                    timeRangeStartMillis: 518000;
                                                    onActiveCommand: {
                                                        clickTrackingParams: 'CKYBEMaHBiITCI3OmpqwsogDFa9Y9QUdPS8SAw==';
                                                        setActivePanelItemAction: {
                                                            panelTargetId: 'engagement-panel-macro-markers-description-chapters';
                                                            itemIndex: 5;
                                                        };
                                                    };
                                                    thumbnail: {
                                                        thumbnails: [
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_518300.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLBOjX1hkP93tl7SP11Ge5YF82Z5-Q';
                                                                width: 168;
                                                                height: 94;
                                                            },
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_518300.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCYVGh5YQdDXZ3f2OLxjhx-su-gGw';
                                                                width: 336;
                                                                height: 188;
                                                            },
                                                        ];
                                                    };
                                                };
                                            },
                                            {
                                                chapterRenderer: {
                                                    title: {
                                                        simpleText: 'Counting weights and biases';
                                                    };
                                                    timeRangeStartMillis: 694000;
                                                    onActiveCommand: {
                                                        clickTrackingParams: 'CKYBEMaHBiITCI3OmpqwsogDFa9Y9QUdPS8SAw==';
                                                        setActivePanelItemAction: {
                                                            panelTargetId: 'engagement-panel-macro-markers-description-chapters';
                                                            itemIndex: 6;
                                                        };
                                                    };
                                                    thumbnail: {
                                                        thumbnails: [
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_711233.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLBSVEAud1TsnrfMrM2FKfQV0NFAJg';
                                                                width: 168;
                                                                height: 94;
                                                            },
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_711233.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAS3o3CBN8KV_aOVGuKAd0V3al6hQ';
                                                                width: 336;
                                                                height: 188;
                                                            },
                                                        ];
                                                    };
                                                };
                                            },
                                            {
                                                chapterRenderer: {
                                                    title: {
                                                        simpleText: 'How learning relates';
                                                    };
                                                    timeRangeStartMillis: 750000;
                                                    onActiveCommand: {
                                                        clickTrackingParams: 'CKYBEMaHBiITCI3OmpqwsogDFa9Y9QUdPS8SAw==';
                                                        setActivePanelItemAction: {
                                                            panelTargetId: 'engagement-panel-macro-markers-description-chapters';
                                                            itemIndex: 7;
                                                        };
                                                    };
                                                    thumbnail: {
                                                        thumbnails: [
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_755266.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLAbUT721gCCjYBL80W3NYD7mRHknQ';
                                                                width: 168;
                                                                height: 94;
                                                            },
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_755266.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBGrRVPeNIVVe8N4r7MiTqBAdccew';
                                                                width: 336;
                                                                height: 188;
                                                            },
                                                        ];
                                                    };
                                                };
                                            },
                                            {
                                                chapterRenderer: {
                                                    title: {
                                                        simpleText: 'Notation and linear algebra';
                                                    };
                                                    timeRangeStartMillis: 806000;
                                                    onActiveCommand: {
                                                        clickTrackingParams: 'CKYBEMaHBiITCI3OmpqwsogDFa9Y9QUdPS8SAw==';
                                                        setActivePanelItemAction: {
                                                            panelTargetId: 'engagement-panel-macro-markers-description-chapters';
                                                            itemIndex: 8;
                                                        };
                                                    };
                                                    thumbnail: {
                                                        thumbnails: [
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_831100.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLCHhrt7ZAIAVQtM87X9YPy5nWMfMQ';
                                                                width: 168;
                                                                height: 94;
                                                            },
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_831100.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDm4xS9fxKpt_R6e7msDZWiz61vwQ';
                                                                width: 336;
                                                                height: 188;
                                                            },
                                                        ];
                                                    };
                                                };
                                            },
                                            {
                                                chapterRenderer: {
                                                    title: {
                                                        simpleText: 'Recap';
                                                    };
                                                    timeRangeStartMillis: 917000;
                                                    onActiveCommand: {
                                                        clickTrackingParams: 'CKYBEMaHBiITCI3OmpqwsogDFa9Y9QUdPS8SAw==';
                                                        setActivePanelItemAction: {
                                                            panelTargetId: 'engagement-panel-macro-markers-description-chapters';
                                                            itemIndex: 9;
                                                        };
                                                    };
                                                    thumbnail: {
                                                        thumbnails: [
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_925200.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLD4SGMHpVsiwk_Q9sJfSX7Fv68IFg';
                                                                width: 168;
                                                                height: 94;
                                                            },
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_925200.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBkswxJNb18zrzRFtxKEOjnMmsBqA';
                                                                width: 336;
                                                                height: 188;
                                                            },
                                                        ];
                                                    };
                                                };
                                            },
                                            {
                                                chapterRenderer: {
                                                    title: {
                                                        simpleText: 'Some final words';
                                                    };
                                                    timeRangeStartMillis: 987000;
                                                    onActiveCommand: {
                                                        clickTrackingParams: 'CKYBEMaHBiITCI3OmpqwsogDFa9Y9QUdPS8SAw==';
                                                        setActivePanelItemAction: {
                                                            panelTargetId: 'engagement-panel-macro-markers-description-chapters';
                                                            itemIndex: 10;
                                                        };
                                                    };
                                                    thumbnail: {
                                                        thumbnails: [
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_1002033.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLDN3i5jk-8p4BbZFzWEBOBftmvXWQ';
                                                                width: 168;
                                                                height: 94;
                                                            },
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_1002033.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAfztzr4Uld5b3wN9YgND4dFdmREw';
                                                                width: 336;
                                                                height: 188;
                                                            },
                                                        ];
                                                    };
                                                };
                                            },
                                            {
                                                chapterRenderer: {
                                                    title: {
                                                        simpleText: 'ReLU vs Sigmoid';
                                                    };
                                                    timeRangeStartMillis: 1023000;
                                                    onActiveCommand: {
                                                        clickTrackingParams: 'CKYBEMaHBiITCI3OmpqwsogDFa9Y9QUdPS8SAw==';
                                                        setActivePanelItemAction: {
                                                            panelTargetId: 'engagement-panel-macro-markers-description-chapters';
                                                            itemIndex: 11;
                                                        };
                                                    };
                                                    thumbnail: {
                                                        thumbnails: [
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_1029900.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLCJlFsKlIOaH7QOpjGJQx63IMxWkg';
                                                                width: 168;
                                                                height: 94;
                                                            },
                                                            {
                                                                url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault_1029900.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDLVmI_bvRvPb4cNgimoGWHe6QXqg';
                                                                width: 336;
                                                                height: 188;
                                                            },
                                                        ];
                                                    };
                                                };
                                            },
                                        ];
                                        trackingParams: 'CKYBEMaHBiITCI3OmpqwsogDFa9Y9QUdPS8SAw==';
                                        onChapterRepeat: {
                                            clickTrackingParams: 'CKYBEMaHBiITCI3OmpqwsogDFa9Y9QUdPS8SAw==';
                                            openPopupAction: {
                                                popup: {
                                                    notificationActionRenderer: {
                                                        responseText: {
                                                            runs: [
                                                                {
                                                                    text: 'チャプターのループ再生が有効です';
                                                                },
                                                            ];
                                                        };
                                                        actionButton: {
                                                            buttonRenderer: {
                                                                style: 'STYLE_BLUE_TEXT';
                                                                text: {
                                                                    runs: [
                                                                        {
                                                                            text: 'オフにする';
                                                                        },
                                                                    ];
                                                                };
                                                                trackingParams: 'CKgBEPBbIhMIjc6amrCyiAMVr1j1BR09LxID';
                                                                command: {
                                                                    clickTrackingParams: 'CKgBEPBbIhMIjc6amrCyiAMVr1j1BR09LxID';
                                                                    repeatChapterCommand: {
                                                                        repeat: 'REPEAT_CHAPTER_TYPE_DISABLE_REPEAT';
                                                                    };
                                                                };
                                                            };
                                                        };
                                                        trackingParams: 'CKcBELlqIhMIjc6amrCyiAMVr1j1BR09LxID';
                                                    };
                                                };
                                                popupType: 'TOAST';
                                            };
                                        };
                                    };
                                },
                            ];
                        };
                    };
                };
            };
        };
    };
};
