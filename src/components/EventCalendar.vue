<template>
  <div class="event-calendar">
    <!-- Calendar Component -->
    <div class="relative">
      <vue-cal
        :events="formattedBookings"
        @event-click="onEventClick"
        @event-create="openAddEventModal"
        style="height: 600px;"
      />

      <!-- Floating Add Button -->
      <button
        @click="openEmptyAddEventModal"
        class="fixed bottom-5 right-5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        + Add Event
      </button>
    </div>

    <!-- Add Event Modal -->
    <div
      v-if="showAddEventModal"
      class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-6">
        <h2 class="text-xl font-semibold mb-4">Add New Event</h2>
        <form @submit.prevent="addEvent">
          <div class="mb-4">
            <label for="title" class="block text-sm font-medium text-gray-700">Event Title</label>
            <input
              v-model="newEvent.title"
              type="text"
              id="title"
              class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter event title"
              required
            />
          </div>
          <div class="mb-4">
            <label for="start" class="block text-sm font-medium text-gray-700">Start Date & Time</label>
            <input
              v-model="newEvent.startDate"
              type="datetime-local"
              id="start"
              class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div class="mb-4">
            <label for="end" class="block text-sm font-medium text-gray-700">End Date & Time</label>
            <input
              v-model="newEvent.endDate"
              type="datetime-local"
              id="end"
              class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div class="flex justify-between">
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Add Event
            </button>
            <button
              @click="closeModal"
              type="button"
              class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Event Modal -->
    <div
      v-if="showEditEventModal"
      class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-6">
        <h2 class="text-xl font-semibold mb-4">Edit Event</h2>
        <form @submit.prevent="updateEvent">
          <div class="mb-4">
            <label for="edit-title" class="block text-sm font-medium text-gray-700">Event Title</label>
            <input
              v-model="selectedEvent.title"
              type="text"
              id="edit-title"
              class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div class="mb-4">
            <label for="edit-start" class="block text-sm font-medium text-gray-700">Start Date & Time</label>
            <input
              v-model="selectedEvent.startDate"
              type="datetime-local"
              id="edit-start"
              class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div class="mb-4">
            <label for="edit-end" class="block text-sm font-medium text-gray-700">End Date & Time</label>
            <input
              v-model="selectedEvent.endDate"
              type="datetime-local"
              id="edit-end"
              class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div class="flex justify-between">
            <button
              type="submit"
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              Save Changes
            </button>
            <button
              @click="deleteEvent"
              type="button"
              class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Delete Event
            </button>
            <button
              @click="closeModal"
              type="button"
              class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default {
  name: 'EventCalendar',
  components: {
    VueCal,
  },
  data() {
    return {
      bookings: [], // Array of event objects from Firestore
      showAddEventModal: false,
      showEditEventModal: false,
      newEvent: { title: '', startDate: '', endDate: '' },
      selectedEvent: null,
    };
  },
  computed: {
    formattedBookings() {
      // Convert events to the required format
      return this.bookings.map(event => ({
        ...event,
        start: this.formatDateForVueCal(event.start),
        end: this.formatDateForVueCal(event.end),
      }));
    },
  },
  mounted() {
    this.setupListener();
  },
  methods: {
    formatDateForVueCal(dateStr) {
      // Convert ISO date to 'YYYY-MM-DD HH:mm' format
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    setupListener() {
      // Set up a Firestore real-time listener
      this.unsubscribe = onSnapshot(collection(db, 'bookings'), (querySnapshot) => {
        const events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.bookings = events;
        console.log("Events updated:", this.bookings); // Debugging: Check updated bookings
      }, (error) => {
        console.error('Error with Firestore listener:', error);
      });
    },
    async addEvent() {
      if (!this.newEvent.title || !this.newEvent.startDate || !this.newEvent.endDate) {
        alert("Please fill in all fields.");
        return;
      }

      try {
        const event = {
          title: this.newEvent.title,
          start: new Date(this.newEvent.startDate).toISOString(),
          end: new Date(this.newEvent.endDate).toISOString(),
        };

        console.log("Adding Event:", event); // Debugging: Log event to add

        await addDoc(collection(db, 'bookings'), event);
        this.resetNewEvent();
        this.closeModal();
      } catch (error) {
        console.error('Error adding event:', error);
      }
    },
    onEventClick(event) {
      this.selectedEvent = { ...event };
      this.selectedEvent.startDate = new Date(event.start).toISOString().slice(0, 16);
      this.selectedEvent.endDate = new Date(event.end).toISOString().slice(0, 16);
      this.showEditEventModal = true;
    },
    async updateEvent() {
      if (!this.selectedEvent.title || !this.selectedEvent.startDate || !this.selectedEvent.endDate) {
        alert("Please fill in all fields.");
        return;
      }

      try {
        const eventRef = doc(db, 'bookings', this.selectedEvent.id);
        await updateDoc(eventRef, {
          title: this.selectedEvent.title,
          start: new Date(this.selectedEvent.startDate).toISOString(),
          end: new Date(this.selectedEvent.endDate).toISOString(),
        });

        this.closeModal();
      } catch (error) {
        console.error('Error updating event:', error);
      }
    },
    async deleteEvent() {
      try {
        const eventRef = doc(db, 'bookings', this.selectedEvent.id);
        await deleteDoc(eventRef);
        this.closeModal();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    },
    openAddEventModal() {
      this.resetNewEvent();
      this.showAddEventModal = true;
    },
    openEmptyAddEventModal() {
      this.resetNewEvent();
      this.showAddEventModal = true;
    },
    closeModal() {
      this.showAddEventModal = false;
      this.showEditEventModal = false;
    },
    resetNewEvent() {
      this.newEvent = { title: '', startDate: '', endDate: '' };
    }
  },
  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>
