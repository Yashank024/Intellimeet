import queue
import threading
import logging
from typing import Dict, List, Type, Callable
from .events import Event, MeetingProcessedEvent, TaskAssignedEvent, CriticalEscalationEvent, DeadlineReminderEvent
from notifications.notification_service import NotificationService

logger = logging.getLogger("IntelliMeet.EventDispatcher")

class EventDispatcher:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(EventDispatcher, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._listeners: Dict[Type[Event], List[Callable[[Event], None]]] = {}
        self._event_queue = queue.Queue()
        self._initialized = True
        
        # Start background consumer thread
        self._worker_thread = threading.Thread(target=self._process_queue, daemon=True)
        self._worker_thread.start()
        logger.info("Asynchronous Event Dispatcher initialized and background thread started.")

    def subscribe(self, event_type: Type[Event], listener: Callable[[Event], None]):
        """
        Registers a callback listener for a specific event type.
        """
        if event_type not in self._listeners:
            self._listeners[event_type] = []
        self._listeners[event_type].append(listener)
        logger.debug(f"Subscribed listener to event {event_type.__name__}")

    def publish(self, event: Event):
        """
        Queues an event to be processed out-of-band by the background worker thread.
        """
        self._event_queue.put(event)
        logger.info(f"Published event {event.__class__.__name__} to background queue.")

    def _process_queue(self):
        """
        Continuous loop running in a background thread to dispatch events.
        """
        while True:
            try:
                event = self._event_queue.get()
                event_type = type(event)
                if event_type in self._listeners:
                    for listener in self._listeners[event_type]:
                        try:
                            listener(event)
                        except Exception as e:
                            logger.error(f"Error executing listener for event {event_type.__name__}: {e}", exc_info=True)
                self._event_queue.task_done()
            except Exception as e:
                logger.error(f"Error in EventDispatcher consumer worker thread: {e}", exc_info=True)

def setup_event_listeners():
    """
    Decoupled event listeners registration bootstrap.
    """
    dispatcher = EventDispatcher()
    notifier = NotificationService()
    
    def handle_task_assigned(event: TaskAssignedEvent):
        logger.info(f"[Event Dispatcher] Handling TaskAssignedEvent for task '{event.title}' assigned to {event.assignee_name}")
        notifier.send_task_assigned_email(
            assignee_email=event.assignee_email,
            assignee_name=event.assignee_name,
            task_title=event.title,
            due_date=event.due_date,
            project_name=event.project_name
        )
        
    def handle_critical_escalation(event: CriticalEscalationEvent):
        logger.info(f"[Event Dispatcher] Handling CriticalEscalationEvent: escalation '{event.title}' assigned to {event.assignee_name}")
        notifier.send_escalation_assigned_email(
            assignee_email=event.assignee_email,
            assignee_name=event.assignee_name,
            esc_title=event.title,
            severity=event.severity,
            project_name=event.project_name
        )

    def handle_meeting_processed(event: MeetingProcessedEvent):
        logger.info(f"[Event Dispatcher] Handling MeetingProcessedEvent for meeting: '{event.title}' under project: {event.project_name}")
        # Placeholder for other subscribers (e.g. stats generation, websocket pushes)
        pass

    dispatcher.subscribe(TaskAssignedEvent, handle_task_assigned)
    dispatcher.subscribe(CriticalEscalationEvent, handle_critical_escalation)
    dispatcher.subscribe(MeetingProcessedEvent, handle_meeting_processed)

    def handle_deadline_reminder(event: DeadlineReminderEvent):
        logger.info(f"[Event Dispatcher] Handling DeadlineReminderEvent for task '{event.title}' assigned to {event.assignee_name}")
        notifier.send_deadline_reminder_email(
            assignee_email=event.assignee_email,
            assignee_name=event.assignee_name,
            task_title=event.title,
            due_date=event.due_date,
            project_name=event.project_name
        )

    dispatcher.subscribe(DeadlineReminderEvent, handle_deadline_reminder)
    logger.info("Decoupled event listeners successfully registered.")
