import React, { Component } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import { DbmsContext } from 'nims-app-core/dbmsContext';

import Button from 'react-bootstrap/es/Button';
import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';
import { ProfileConstructorRow } from './ProfileConstructorRow';
import { ProfileConstructorRow2 } from './ProfileConstructorRow2';
import { CreateProfileItemDialog } from './CreateProfileItemDialog.jsx';
import { ModalTrigger } from '../../commons/uiCommon3/ModalTrigger.jsx';
import './ProfileConstructor.css';

export class ProfileConstructor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profileStructure: null,
    };
    this.createProfileItem = this.createProfileItem.bind(this);
    this.refresh = this.refresh.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  componentDidMount() {
    this.refresh();
  }

  // componentDidUpdate() {
  //   this.getStateInfo();
  // }

  refresh() {
    const { dbms } = this.props;
    Promise.all([dbms.getProfileStructure({ type: 'character' })]).then((results) => {
      const [profileStructure] = results;
      this.setState({
        profileStructure
      });
    }).catch(UI.handleError);
  }

  createProfileItem() {
    return Promise.resolve();
  }

  onDragEnd(result) {
    const { dbms } = this.props;
    const { destination, source, draggableId } = result;
    if (!destination) {
      return;
    }
    if (destination.droppableId === source.droppableId
      && destination.index === source.index) {
      return;
    }

    dbms.moveProfileItem({
      type: 'character',
      index: source.index,
      newIndex: destination.index
    }).then(this.refresh).catch(UI.handleError);
  }

  render() {
    const { profileStructure } = this.state;
    if (!profileStructure) {
      return null;
    }

    const { dbms, t } = this.props;

    return (
      <div className="profile-constructor block">
        <div className="panel panel-default max-height-100p overflow-auto">
          <div className="panel-body profile-panel">
            <div className="entity-management">
              <div>
                <ModalTrigger
                  modal={(
                    <CreateProfileItemDialog profileStructure={profileStructure} onCreate={this.refresh} />
                  )}
                >
                  <Button
                    className="fa-icon create adminOnly icon-padding"
                  >
                    {t('profiles.create-profile-item')}
                  </Button>
                </ModalTrigger>
              </div>
            </div>
            <InlineNotification type="info" showIf={profileStructure.length === 0}>
              {t('advices.empty-character-profile-structure')}
            </InlineNotification>
            <DragDropContext onDragEnd={this.onDragEnd}>
              <Droppable droppableId="profileItems">
                {
                  (provided) => (
                    <div className="tw-m-auto tw-max-w-screen-md" ref={provided.innerRef} {...provided.droppableProps}>
                      {
                        profileStructure.map((profileStructureItem, i) => (
                          <ProfileConstructorRow2 key={profileStructureItem.name} profileStructureItem={profileStructureItem} i={i} refresh={this.refresh} />
                        ))
                      }
                      {provided.placeholder}
                    </div>
                  )
                }
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    );
  }
}
