import React, { useState } from 'react';
import { Tab, Nav } from 'react-bootstrap';
import './commonTab.scss';
import CheckboxField from '../formik/checkboxField/CheckboxField';
import CustomInputDropdown from '../customInputDropdown/CustomInputDropdown';

export interface TabItem {
    key: string;
    title: string;
    content: React.ReactNode;
}

interface CommonTabsProps {
    tabs: TabItem[];
    defaultActiveKey?: string;
    onTabChange?: (key: string) => void;
    className?: string;
    showFilter?: boolean;
    filterOptions?: { label: string; value: string }[];
    selectedOption?: { label: string; value: string };
    showCheckbox?: boolean;
    checkboxLabel?: string;
    checkboxChecked?: boolean;
    onCheckboxChange?: (checked: boolean) => void;
}

const CommonTabs: React.FC<CommonTabsProps> = ({
    tabs,
    defaultActiveKey,
    onTabChange,
    className = '',
    showFilter = false,
    filterOptions = [],
    selectedOption,

    showCheckbox = false,
    checkboxLabel = '',
    checkboxChecked = false,
    onCheckboxChange,
}) => {
    const [activeKey, setActiveKey] = useState(defaultActiveKey || tabs[0]?.key);

    const handleTabSelect = (key: string) => {
        setActiveKey(key);
        onTabChange?.(key);
    };


    return (
        <Tab.Container activeKey={activeKey} onSelect={(k) => k && handleTabSelect(k)}>
            <div className="tab-nav-wrapper">
                {/* Tabs */}
                <Nav variant="tabs" className={`custom-tabs ${className}`}>
                    {tabs.map((tab) => (
                        <Nav.Item key={tab.key}>
                            <Nav.Link eventKey={tab.key}>{tab.title}</Nav.Link>
                        </Nav.Item>
                    ))}
                </Nav>

                {showFilter && filterOptions.length > 0 && selectedOption && (
                    <div className="d-flex align-items-center ms-3 right_section">


                        <CustomInputDropdown options={filterOptions} />


                        {showCheckbox && (
                            <div className="tab-checkbox-wrapper ms-3 pe-3">
                                <CheckboxField
                                    value={checkboxChecked}
                                    onChange={(e) => onCheckboxChange?.(e.target.checked)}
                                    label={checkboxLabel}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Tab.Content>
                {tabs.map((tab) => (
                    <Tab.Pane eventKey={tab.key} key={tab.key}>
                        <div className="tab_content">{tab.content}</div>
                    </Tab.Pane>
                ))}
            </Tab.Content>
        </Tab.Container>
    );
};

export default CommonTabs;
