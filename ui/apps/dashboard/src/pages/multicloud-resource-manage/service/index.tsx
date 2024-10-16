import Panel from '@/components/panel';
import {Button, Input, Segmented, Select} from "antd";
import {ServiceKind} from "@/services/base";
import {Icons} from "@/components/icons";
import {useQuery} from "@tanstack/react-query";
import {GetNamespaces} from "@/services/namespace";
import {useCallback, useMemo, useState} from "react";
import {useToggle, useWindowSize} from "@uidotdev/usehooks";
import ServiceTable from './components/service-table'
import ServiceEditorModal from './components/service-editor-modal'
import i18nInstance from "@/utils/i18n.tsx";
import {stringify} from "yaml";
import IngressTable from "@/pages/multicloud-resource-manage/service/components/ingress-table";

const ServicePage = () => {
    const [filter, setFilter] = useState<{
        selectedWorkSpace: string;
        searchText: string;
        kind: ServiceKind,
    }>({
        selectedWorkSpace: '',
        searchText: '',
        kind: ServiceKind.Service

    });
    const {data: nsData, isLoading: isNsDataLoading} = useQuery({
        queryKey: ['GetNamespaces'],
        queryFn: async () => {
            const clusters = await GetNamespaces({});
            return clusters.data || {};
        },
    });
    const nsOptions = useMemo(() => {
        if (!nsData?.namespaces) return [];
        return nsData.namespaces.map((item) => {
            return {
                title: item.objectMeta.name,
                value: item.objectMeta.name,
            };
        });
    }, [nsData]);

    const size = useWindowSize();
    const labelTagNum = size && size.width! > 1800 ? undefined : 1
    const [editorState, setEditorState] = useState<{
        mode: 'create' | 'edit';
        content: string;
    }>({
        mode: 'create',
        content: '',
    });
    const [showModal, toggleShowModal] = useToggle(false);
    const resetEditorState = useCallback(() => {
        setEditorState({
            mode: 'create',
            content: '',
        });
    }, []);
    return (
        <Panel>
            <div className={'flex flex-row justify-between mb-4'}>
                <div>
                    <Segmented
                        style={{marginBottom: 8}}
                        options={[
                            {
                                label: 'Service',
                                value: ServiceKind.Service,
                            },
                            {
                                label: 'Ingress',
                                value: ServiceKind.Ingress,
                            },
                        ]}
                        value={filter.kind}
                        onChange={(value) => {
                            // reset filter when switch workload kind
                            if (value !== filter.kind) {
                                setFilter({
                                    ...filter,
                                    kind: value,
                                    selectedWorkSpace: '',
                                    searchText: '',
                                });
                            } else {
                                setFilter({
                                    ...filter,
                                    kind: value,
                                });
                            }
                        }}
                    />
                </div>
                <Button
                    type={'primary'}
                    icon={<Icons.add width={16} height={16}/>}
                    className="flex flex-row items-center"
                    onClick={() => {
                        toggleShowModal(true);
                    }}
                >
                    新增服务
                </Button>
            </div>
            <div className={'flex flex-row space-x-4 mb-4'}>
                <h3 className={'leading-[32px]'}>
                    {i18nInstance.t('280c56077360c204e536eb770495bc5f')}
                </h3>
                <Select
                    options={nsOptions}
                    className={'min-w-[200px]'}
                    value={filter.selectedWorkSpace}
                    loading={isNsDataLoading}
                    showSearch
                    allowClear
                    onChange={(v) => {
                        setFilter({
                            ...filter,
                            selectedWorkSpace: v,
                        });
                    }}
                />
                <Input.Search
                    placeholder={i18nInstance.t('cfaff3e369b9bd51504feb59bf0972a0')}
                    className={'w-[300px]'}
                    onPressEnter={(e) => {
                        const input = e.currentTarget.value;
                        setFilter({
                            ...filter,
                            searchText: input,
                        });
                    }}
                />
            </div>
            {
                filter.kind === ServiceKind.Service && <ServiceTable
                    labelTagNum={labelTagNum}
                    searchText={filter.searchText}
                    selectedWorkSpace={filter.selectedWorkSpace}
                    onViewServiceContent={(r) => {
                        setEditorState({
                            mode: 'edit',
                            content: stringify(r),
                        });
                        toggleShowModal(true);
                    }}
                    onDeleteServiceContent={() => {

                    }}
                />
            }
            {
                filter.kind === ServiceKind.Ingress && <IngressTable
                    labelTagNum={labelTagNum}
                    searchText={filter.searchText}
                    selectedWorkSpace={filter.selectedWorkSpace}
                    onViewIngressContent={(r) => {
                        setEditorState({
                            mode: 'edit',
                            content: stringify(r),
                        });
                        toggleShowModal(true);
                    }}
                    onDeleteIngressContent={() => {

                    }}
                />
            }

            <ServiceEditorModal
                mode={editorState.mode}
                open={showModal}
                serviceContent={editorState.content}
                onOk={(ret) => {
                    console.log(ret)
                }}
                onCancel={() => {
                    resetEditorState();
                    toggleShowModal(false);
                }}
            />
        </Panel>
    );
};

export default ServicePage;
